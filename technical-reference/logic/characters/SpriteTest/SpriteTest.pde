import java.util.Map;

JSONObject json;
StringList filenames;
ArrayList<PImage> images;
String action;
String[] properties;
//StringList framenames;
StringList inventory;
int currentFrame = 0;
HashMap<String,StringList> hm;

void setup() {
  size(720, 720);
  frameRate(12);
  imageMode(CENTER);
  
  filenames = new StringList();
  filenames.append("data/Ninja5-0.png");
  filenames.append("data/Ninja5-1.png");
  filenames.append("data/Ninja5-2.png");
  filenames.append("data/Ninja5-3.png");
  filenames.append("data/Ninja5-4.png");
  filenames.append("data/Ninja5-5.png");
  filenames.append("data/Ninja5-6.png");
  filenames.append("data/Ninja5-7.png");
  filenames.append("data/Ninja5-8.png");
  filenames.append("data/Ninja5-9.png");
  
  images = new ArrayList();
  for(int i = 0; i < filenames.size(); i++){
    PImage p = loadImage(filenames.get(i));
    images.add(p);
  }

  //json = loadJSONObject("data/result.json");
  json = loadJSONObject("data/result5.json");
  properties = (String[]) json.keys().toArray(new String[json.size()]);
  hm = new HashMap<String,StringList>();
  String[] actions = new String[6];
  actions[0] = "Idle";
  actions[1] = "Punch";
  actions[2] = "Kick";
  actions[3] = "React1";
  actions[4] = "React2";
  actions[5] = "Katana";
  String[] parts = new String[5];
  parts[0] = "HeadBack";
  parts[1] = "Torso";
  parts[2] = "Legs";
  parts[3] = "Skin";
  parts[4] = "Eyes";

  for (int i = 0; i < actions.length; i++){
    for (int j = 0; j < parts.length; j++){
      String name = actions[i] + "_" + parts[j];
      StringList framenames = new StringList();
      for (int k = 0; k < properties.length; k++){
        if (properties[k].contains(name)){
          framenames.append(properties[k]);
        }
      }
      framenames.sort();
      hm.put(name, framenames);
    }
  }
  println(hm);
  println(images.get(0));
  action = "Katana";
}

private void draw_part(String name){
  
  JSONObject frame = json.getJSONObject(hm.get(name).get(currentFrame % hm.get(name).size()));
  JSONObject dims = frame.getJSONObject("frame");
  JSONObject sourceSize = frame.getJSONObject("sourceSize");
  JSONObject spriteSourceSize = frame.getJSONObject("spriteSourceSize");
  int sprite_x = (spriteSourceSize.getInt("x")+(spriteSourceSize.getInt("w")/2))-(sourceSize.getInt("w")/2);
  int sprite_y = (spriteSourceSize.getInt("y")+(spriteSourceSize.getInt("h")/2))-(sourceSize.getInt("h")/2);
  image(images.get(frame.getInt("fileid")).get(dims.getInt("x"), dims.getInt("y"), dims.getInt("w"), dims.getInt("h")),360+sprite_x,360+sprite_y);
  println(name, sourceSize, sprite_x, sprite_y);
}

void draw() {
  background(255); // Set background to black
  currentFrame = (currentFrame+1) % hm.get(action + "_Torso").size();
  draw_part(action + "_Legs");
  draw_part(action + "_Torso");
  draw_part(action + "_HeadBack");
  draw_part(action + "_Skin");
  draw_part(action + "_Eyes");
}
