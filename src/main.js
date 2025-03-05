import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'

function raySphereIntersection(C, r, D, S) {
  // Calculate the vector from the ray's start point to the sphere's center
  const L = [C[0] - S[0], C[1] - S[1], C[2] - S[2]];
  
  // Calculate the projection of L onto the ray direction D
  const tca = L[0] * D[0] + L[1] * D[1] + L[2] * D[2];
  
  // Calculate the squared distance from the sphere's center to the projection
  const d2 = L[0] * L[0] + L[1] * L[1] + L[2] * L[2] - tca * tca;
  
  // If the distance is greater than the radius squared, there's no intersection
  if (d2 > r * r) return null;
  
  // Calculate the distance from the projection to the intersection points
  const thc = Math.sqrt(r * r - d2);
  
  // Calculate the intersection distances along the ray
  const t0 = tca - thc;
  const t1 = tca + thc;
  
  // Return the nearest positive intersection distance
  if (t0 > 0 && t1 > 0) {
      return Math.min(t0, t1);
  } else if (t0 > 0) {
      return t0;
  } else if (t1 > 0) {
      return t1;
  }
  
  // No positive intersection, return null
  return null;
}

function subtractVectors(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function addVectors(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function vectorLength(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function normalizeVec(vec) {
  return multiplyByScalar(vec, 1 / vectorLength(vec));
}

function multiplyByScalar(v, scalar) {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

function componentWiseMult(v1, v2) {
  return [v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2]];
}

function dotProduct(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function reflectVector(incomingVector, normalVector) {
  // Calculate the dot product of the incoming vector and the normal vector
  const dot = dotProduct(incomingVector, normalVector);

  // Calculate the reflected vector
  const reflectedVector = [
    incomingVector.x - 2 * dot * normalVector.x,
    incomingVector.y - 2 * dot * normalVector.y,
    incomingVector.z - 2 * dot * normalVector.z
  ];

  return reflectedVector;
}

const LARGE = 9000;

//=================================
// Scene
// const sphere1Center = [0, 0, 0];
// const sphere1r = 1;

const spheres = [
  {
    center: [0, 0, 2],
    r: 1,
    color: [1, 0, 1],
    reflect: false,
  },
  {
    center: [4, 1, 0],
    r: 2,
    color: [0.2, 0.6, 1],
    reflect: false,
  },
  {
    center: [-3, 2, -1],
    r: 2,
    color: [1, 1, 1],
    reflect: true,
  },
  {
    center: [0, -LARGE, 0],
    r: LARGE,
    color: [1, 1, 1],
    reflect: false,
  },
]

const rayDir = [0, 0, -1];
const rayStart = [0, 1, 5];

const lightPos = [0, 10, 0];
//=================================


const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const pixelBytes = new Uint8Array([
  0, 0, 255, 255,
  0, 255, 0, 255,
  255, 0, 0, 255
]);

const width = canvas.width;
const height = canvas.height;

const imageData = ctx.createImageData(width, height);
imageData.data.set(pixelBytes, 0)

function render() {
  
  for (let y = 0; y < height; y++) {
    const pixelY = (y / height) - 0.5;
    for (let x = 0; x < width; x++) {
      const pixelX = (x / width) - 0.5;
  
      const pixelPos = [pixelX * 10, -pixelY * 10, 0];
      
      let rayDir = subtractVectors(pixelPos, rayStart);
      rayDir = multiplyByScalar(rayDir, 1 / vectorLength(rayDir));

      const irradiance = getIrradiance(rayDir, rayStart, 0);
      
      const r = irradiance[0] * 255;
      const g = irradiance[1] * 255;
      const b = irradiance[2] * 255;
  
      imageData.data[(y * width + x) * 4 + 0] = r;
      imageData.data[(y * width + x) * 4 + 1] = g;
      imageData.data[(y * width + x) * 4 + 2] = b;
      imageData.data[(y * width + x) * 4 + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}  


function getIrradiance(rayDir, rayStart, depth) {
  if (depth > 3) {
    return [0, 0, 0];
  }
  let nearestHitPoint = null;
  let nearestDist = Infinity;

  for (const sphere of spheres) {
    const t = raySphereIntersection(sphere.center, sphere.r, rayDir, rayStart);

    if (t != null) {
      const hitPos = addVectors(multiplyByScalar(rayDir, t), rayStart);
      if (t > 0 && t < nearestDist) {
        nearestDist = t;
        nearestHitPoint = {
          normal: normalizeVec(subtractVectors(hitPos, sphere.center)),
          pos: hitPos,
          color: sphere.color,
          reflect: sphere.reflect
        };
      }
    }
  }

  let irradiance = [0, 0, 0];

  if (nearestHitPoint != null) {
    const hitPos = nearestHitPoint.pos;
    const normal = nearestHitPoint.normal;
    const toLight = normalizeVec(subtractVectors(lightPos, hitPos));
    const lightIntensity = Math.max(0, dotProduct(normal, toLight));

    // console.log("not null");
    let color = nearestHitPoint.color;
    if (nearestHitPoint.reflect) {
      const reflectDir = reflectVector(rayDir, nearestHitPoint.normal);
      const newStart = addVectors(nearestHitPoint.pos, multiplyByScalar(reflectDir, 0.05));
      irradiance = getIrradiance(reflectDir, newStart, depth + 1);
      // irradiance = [1, 0, 0];
    } else {
      irradiance = multiplyByScalar(color, lightIntensity);
    }
  }
  return irradiance;
}

function updateScreen() {
  spheres[0].center[1] = Math.sin(Date.now() / 300);
  render();
  window.requestAnimationFrame(updateScreen);
}

window.requestAnimationFrame(updateScreen)
