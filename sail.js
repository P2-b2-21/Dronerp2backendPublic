function calculateSail(ARC, GRC) {
  let SAILMatrix = [
    [6, 6, 6, 6, 6, 6],
    [4, 4, 4, 4, 5, 6],
    [2, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
  ];
  return SAILMatrix[ARC][GRC];
}
let SAIL = calculateSail(1, 1);
console.log(SAIL);
