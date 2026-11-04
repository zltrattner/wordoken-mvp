function Probability(level1, level2)
{
    return 1.0 * 1.0 / (1 + 1.0 * pow(10,1.0 * (pow(level1,0.5) - pow(level2, 0.5)) / 10));
}

function GetWinBoost(level1, level2, k)
{
  var p = Probability(level1, level2);
  k *=  pow(level1, 0.5);
  return k * p
}

function GetDrawBoost(level1, level2, k)
{
  var p = Probability(level1, level2);
  k *=  pow(level1, 0.5);
  return ((k * p)/2) + ((-k * (1 - p))/2);
}

function GetLossBoost(level1, level2, k)
{
  var p = Probability(level1, level2);
  k *=  pow(level1, 0.5);
  return -k * (1 - p);
}

function ModifyThreshold(level)
{
  return level * 10;
}

function GetBoost(b1, b2, b3, result)
{
  if (result == 1){
    return b1;
  } else if (result == -1){
    return b2
  } else {
    return b3;
  }
}

function setup() {
  createCanvas(400, 400);
  
  var mylevel = 10;
  var opplevel = 10;
  var k = 10;
  var result = 1;
  
  var winboost = GetWinBoost(mylevel, opplevel, k);
  var drawboost = GetDrawBoost(mylevel, opplevel, k);
  var lossboost = GetLossBoost(mylevel, opplevel, k);
  
  var points = 50;
  var xp = 0;
  var gameplayedboost = 5;
  var levelthreshold = [...Array(ModifyThreshold(mylevel)).keys()].reduce((partialSum, a) => partialSum + a, 0);
  
  xp += Math.round((points + gameplayedboost + GetBoost(winboost, lossboost, drawboost, result)));
  
  print("XP: " + xp);
  print("My Level: " + mylevel);
  print("New Level Threshold: " + levelthreshold);
  print("Probability: " + Probability(mylevel, opplevel));
  //print("Win Boost: " + winboost);
  //print("Draw Boost: " + drawboost);
  //print("Loss Boost: " + lossboost);
}

function draw() {
  background(220);
}