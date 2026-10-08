/* Avatar — articulated reference mesh (Mixamo rig sample, NOT the subtle body).
   Provides: posed surface, named bones (channels can parent to spine),
   breath swell hook, built-in clips. Subtle layers stay separate and primary.
   Replace Xbot.glb with a neutral licensed GLB before any release. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function buildAvatar(opts){
  const { scene } = opts;
  const gltf = await new GLTFLoader().loadAsync('assets/Xbot.glb');
  const root = gltf.scene;
  /* fit height to the square (7.2 scene units) */
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Box3().getSize(box, new THREE.Vector3());
  const s = 7.2 / size.y;
  root.scale.setScalar(s);
  root.position.y = -3.9;
  root.traverse(o=>{
    if(o.isMesh){
      o.material = o.material.clone();
      o.material.transparent = true; o.material.opacity = 0.14;
      o.material.depthWrite = true;
    }
  });
  const bones = {};
  root.traverse(o=>{ if(o.isBone) bones[o.name.replace('mixamorig:','')] = o; });
  /* humanoid-standard aliases (VRM/Humanoid bone names): pose once, any mesh.
     Freaktown's avatar.v1 contract uses the same capability idea. */
  const HUMAN = {hips:'Hips', spine:'Spine', chest:'Spine1', upperChest:'Spine2',
    neck:'Neck', head:'Head', shoulderL:'LeftShoulder', armL:'LeftArm', foreL:'LeftForeArm',
    handL:'LeftHand', shoulderR:'RightShoulder', armR:'RightArm', foreR:'RightForeArm',
    handR:'RightHand', thighL:'LeftUpLeg', shinL:'LeftLeg', footL:'LeftFoot',
    thighR:'RightUpLeg', shinR:'RightLeg', footR:'RightFoot'};
  const humanoid = {};
  for(const [h,m] of Object.entries(HUMAN)) humanoid[h]=bones[m]||null;
  const mixer = new THREE.AnimationMixer(root);
  const clips = {};
  for(const c of gltf.animations||[]) clips[c.name] = c;
  let active = null;
  function playClip(name){
    if(!clips[name]) return false;
    if(active) mixer.stopAllAction();
    active = mixer.clipAction(clips[name]); active.play();
    return true;
  }
  const group = new THREE.Group();
  group.add(root);
  group.visible = false;
  scene.add(group);
  const api = {
    group, bones, humanoid, mixer, clips: Object.keys(clips),
    /* breath swell: chest expands ~3% — call each frame with phase 0..1 */
    breathe(k){
      const sp = this.humanoid.chest||bones.Spine2||bones.Spine1||bones.Spine;
      if(sp){ const s2 = 1+0.035*k; sp.scale.set(s2,1,s2); }
    },
    setPose(name){
      group.rotation.z = 0; group.position.set(0,0,0);
      root.rotation.set(0,0,0);
      if(name==='stand'){ playClip('idle'); }
      else if(name==='seat'){ if(!playClip('sad_pose')) root.rotation.x = 0; }
      else if(name==='lie'){ mixer.stopAllAction(); group.rotation.z = -Math.PI/2; group.position.set(-3.2,1.4,0); }
      return name;
    },
    show(v){ group.visible = v; },
    tick(dt){ mixer.update(dt); },
  };
  api.setPose('stand');
  return api;
}
