/* @flow */
import ExpoGraphics from 'expo-graphics'; // 0.0.3
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { GLView }  from 'expo';
import ExpoTHREE, { THREE } from 'expo-three';
import TextMesh from '../components/TextMesh';

export default class ArScreen extends Component {
  onContextCreate = async ({ gl, arSession, width, height, scale }) => {
    this.renderer = ExpoTHREE.renderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xffffff, 1.0);

    // scene
    this.scene = new THREE.Scene();

    if (arSession) {
      // AR Background Texture
      this.scene.background = ExpoTHREE.createARBackgroundTexture(
        arSession,
        this.renderer,
      );

      /// AR Camera
      this.camera = ExpoTHREE.createARCamera(
        arSession,
        width / scale,
        height / scale,
        0.01,
        1000,
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(
        70,
        width / height,
        0.01,
        10000,
      );
      this.camera.position.set(0, 5, 10);
      this.camera.lookAt(new THREE.Vector3(0,10,-10));
    }
    this.setupLights();
    this.createText();
  };
  setupLights = () => {
    let light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(0, 0, -1);
    this.scene.add(light);
    let lighta = new THREE.PointLight(0xffffff, 1.5);
    lighta.position.set(0, 100, 90);
    this.scene.add(lighta);
  };

  createText = () => {
    this.textMesh = new TextMesh();
    // this.textMesh.rotation.y = Math.PI;
    this.scene.add(this.textMesh);
    this.textMesh.material = new THREE.MeshPhongMaterial({ color: 0x056ecf });
    this.textMesh.update({
      text: 'Hey There :)',
      font: require('../three_fonts/neue_haas_unica_pro_medium.json'), // This accepts json, THREE.Font, or a uri to remote THREE.Font json
      size: 10, //Size of the text. Default is 100.
      height: 5, //Thickness to extrude text. Default is 50.
      curveSegments: 12, // — Integer. Number of points on the curves. Default is 12.
      bevelEnabled: false, // — Boolean. Turn on bevel. Default is False.
      bevelThickness: 1, // — Float. How deep into text bevel goes. Default is 10.
      bevelSize: 0.8, // — Float. How far from text outline is bevel. Default is 8.
      bevelSegments: 0.3, // — Integer. Number of bevel segments. Default is 3.
    });
    ExpoTHREE.utils.scaleLongestSideToSize(this.textMesh, 1);
    ExpoTHREE.utils.alignMesh(this.textMesh, { y: 1, x: 0.5, z: 0.5 });
  };

  onRender = delta => {
    // this.scene.rotation.y -= 0.5 * delta;
    this.renderer.render(this.scene, this.camera);
  };

  onResize = ({ width, height, scale }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{ height: '100%', flex: 1 }}
        >
          <ExpoGraphics.View
            style={{ flex: 1 }}
            onContextCreate={this.onContextCreate}
            onRender={this.onRender}
            onResize={this.onResize}
            arEnabled={true}
          />
          <TextInput
            style={{
              height: 40,
              borderTopColor: 'gray',
              borderTopWidth: 1,
              width: '100%',
              fontSize: 24,
              color: '#056ECF',
              paddingHorizontal: 12,
            }}
            onChangeText={text => (this.textMesh.text = text)}
          />
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
