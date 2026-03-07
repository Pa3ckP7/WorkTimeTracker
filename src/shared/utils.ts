export function getTimeDifferenceSeconds(start: Date, end: Date){
  return Math.floor((end.getTime() - start.getTime())/1000);
}
