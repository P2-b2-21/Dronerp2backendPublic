import { GRC } from "form/form.js";

function calculateGRC() {
  calcintrinsicvalue(lineOfSight.BVLOS, flightType.Populated);
  if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 1
  ) {
    return;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 2
  ) {
    intrinsicValue -= 3;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 3
  ) {
    intrinsicValue -= 7;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 4
  ) {
    return;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 1
  ) {
    return;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 2
  ) {
    intrinsicValue -= 3;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 3
  ) {
    intrinsicValue -= 6;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 4
  ) {
    return;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 1
  ) {
    return;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 2
  ) {
    intrinsicValue -= 2;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 3
  ) {
    intrinsicValue -= 5;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 4
  ) {
    return;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 1
  ) {
    intrinsicValue -= 1;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 2
  ) {
    intrinsicValue -= 2;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 3
  ) {
    intrinsicValue -= 4;
  } else if (
    GRCanswers[3] === 1 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 2 &&
    GRCanswers[6] === 4
  ) {
    return;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 1
  ) {
    intrinsicValue += 1;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 2
  ) {
    intrinsicValue -= 1;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 3
  ) {
    intrinsicValue -= 3;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 1 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 4
  ) {
    return;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 1
  ) {
    intrinsicValue += 1;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 2
  ) {
    return;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 3
  ) {
    intrinsicValue -= 1;
  } else if (
    GRCanswers[3] === 2 &&
    GRCanswers[4] === 2 &&
    GRCanswers[5] === 1 &&
    GRCanswers[6] === 4
  ) {
    return;
  } else return;
  console.log(intrinsicValue);
  return intrinsicValue;
}

function calcintrinsicvalue(LOS, type) {
  let y = type + LOS;
  console.log("Los: " + LOS);
  console.log("Flight Type: " + type);
  console.log("Y: " + y);
  console.log(GRCMatrix[0][y]);
}
function calculateSail(ARC) {
  let SAIL = 0;
  let ARC = 0;

  let SAILMatrix = [
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ];

  let y = GRC + ARC;
  console.log(y);
  return SAIL;
}
calculateSail();
