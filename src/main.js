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

function vectorLength(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function multiplyByScalar(v, scalar) {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

const sphere1Center = [0, 4, 0];
const sphere1r = 1;

const rayDir = [0, 0, -1];
const rayStart = [0, 0, 5];

const t = raySphereIntersection(sphere1Center, sphere1r, rayDir, rayStart);
console.log(t);


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

const channelsPerPixel = 4;
for (let y = 0; y < height; y++) {
  const pixelY = (y / height) - 0.5;
  for (let x = 0; x < width; x++) {
    const pixelX = (x / width) - 0.5;

    const pixelPos = [pixelX * 10, pixelY * 10, 0];

    let rayDir = subtractVectors(pixelPos, rayStart);
    rayDir = multiplyByScalar(rayDir, 1 / vectorLength(rayDir));

    const t = raySphereIntersection(sphere1Center, sphere1r, rayDir, rayStart);
    
    let r = 0;
    let g = 0;
    let b = 0;
    if (t == null) {
      r = g = b = 0;
    } else {
      // console.log("not null");
      r = g = b = 255;
    }


    imageData.data[(y * width + x) * 4 + 0] = r;
    imageData.data[(y * width + x) * 4 + 1] = g;
    imageData.data[(y * width + x) * 4 + 2] = b;
    imageData.data[(y * width + x) * 4 + 3] = 255;
  }
}

ctx.putImageData(imageData, 0, 0);
