{

	"metadata": {
		"formatVersion": 3.99,
		"type" : "zordon_scene"
	},

	"urlBaseType" : "",

	"objects": {
	
		"dummy_group" : {
			"position" : [ 0, -66, 0 ],
			"rotation" : [ 0, 0, 0 ],
			"scale"	   : [ 1, 1, 1 ],
			"visible"  : true,
			"children" : {
				
				
			}
		},
	
		"gltf_group" : {
			"position" : [ 0, -10, 0 ],
			"rotation" : [ 0, 0, 0 ],
			"scale"	   : [ 1, 1, 1 ],
			"visible"  : true,
			"children" : {
				
				
			}
		},
		
		"main_group" : {
			"position" : [ 0, 0, 0 ],
			"rotation" : [ 0, 0, 0 ],
			"scale"	   : [ 1, 1, 1 ],
			"visible"  : true,
			"children" : {
            				                    
                "o_cube" : {
                    "geometry" : "g_cube",
                    "material" : "m_plane_basic",
                    "position" : [ 2.5, 0, -25 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"	   : [ 2.5, 2.5, 2.5 ],
                    "visible"  : true,
                    "castShadow": true,
                    "receiveShadow": true,
                    "userData" : {
                    }
                },
            				                    
                "o_cube2" : {
                    "geometry" : "g_cube2",
                    "material" : "m_plane_basic",
                    "position" : [ 2.5, 10, -25 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"	   : [ 10, 0.2, 2.5 ],
                    "visible"  : true,
                    "castShadow": true,
                    "receiveShadow": true,
                    "userData" : {
                    }
                },
            				                    
                "o_sphere" : {
                    "geometry" : "g_sphere",
                    "material" : "m_plane_basic",
                    "position" : [ 18, 0, -25 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"	   : [ 2.5, 2.5, 2.5 ],
                    "visible"  : true,
                    "castShadow": true,
                    "receiveShadow": true,
                    "userData" : {
                    }
                },
            				                    
                "o_sphere2" : {
                    "geometry" : "g_sphere2",
                    "material" : "m_plane_basic",
                    "position" : [ -12, 0, -25 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"	   : [ 2.5, 2.5, 2.5 ],
                    "visible"  : true,
                    "castShadow": true,
                    "receiveShadow": true,
                    "userData" : {
                    }
                },
            				                    
                "o_sphere3" : {
                    "geometry" : "g_sphere2",
                    "material" : "m_plane_basic",
                    "position" : [ -12, 0, -10 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"	   : [ 2.5, 2.5, 2.5 ],
                    "visible"  : true,
                    "castShadow": true,
                    "receiveShadow": true,
                    "userData" : {
                    }
                },
            				                    
                "o_sphere4" : {
                    "geometry" : "g_sphere2",
                    "material" : "m_plane_basic",
                    "position" : [ -12, 0, 5 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"	   : [ 2.5, 2.5, 2.5 ],
                    "visible"  : true,
                    "castShadow": true,
                    "receiveShadow": true,
                    "userData" : {
                    }
                },
            				                    
                "o_plane" : {
                    "geometry" : "g_plane",
                    "material" : "m_plane_basic",
                    "position" : [ 2.5, -9.9, -20 ],
                    "rotation" : [ -1.57, 0, 0 ],
                    "scale"	   : [ 5, 5, 5 ],
                    "visible"  : true,
                    "castShadow": true,
                    "receiveShadow": true,
                    "userData" : {
                    }
                }
			}
		},
        
        "light_group" : {
			"position" : [ 0, 0, 0 ],
			"rotation" : [ 0.75, 0, 0 ],
			"scale"	   : [ 1, 1, 1 ],
			"visible"  : true,
			"children" : {
                
                "light_groupZ" : {
                    "position" : [ 0, 0, 0 ],
                    "rotation" : [ 0, 0, -0.75 ],
                    "scale"	   : [ 1, 1, 1 ],
                    "visible"  : true,
                    "children" : {
        
                        "l_dir1": {
                            "type"	  : "DirectionalLight",
                            "direction": [ 0, 50, 0 ],
                            "color"   : 16777215,
                            "intensity"	 : 3.0,
                            "castShadow": true
                        }
                    }
                }
            }
        },
		

		"Default_View": {
			"type"  : "PerspectiveCamera",
			"fov"   : 45,
			"aspect": 1.33333,
			"near": 1,
			"far"   : 2000,
			"position": [0, 5, 50],
			"target"  : [ 0, 0, 0 ],
			"userData": {
					"easing": "easeInOutCubic",
					"parameters": {
						"minDistance": 1,
						"maxDistance": 1000,
						"enableDamping": true,
						"dampingFactor": 0.05,
						"rotateSpeed": 0.02,
						"zoomSpeed": 0.2,
						"panSpeed": 0.1,
                        "maxPolarAngle": 3.14,
                        "minPolarAngle": 0,
						"autoRotateSpeed": 0.1,
						"screenSpacePanning": true,
						"enablePan": true,
						"enableZoom": true
					}
				},
			"children" : {
				
				
			}
			
        }
			
	},

	"geometries": {

		"g_plane": {
			"type"   : "plane",
			"width"  : 10,
			"height" : 10,
			"widthSegments"  : 10,
			"heightSegments" : 10
		},

		"g_cube": {
			"type"   : "cube",
			"width"  : 5,
			"height" : 5,
			"depth" : 5,
			"widthSegments"  : 10,
			"heightSegments" : 10,
			"depthSegments" : 10
		},

		"g_cube2": {
			"type"   : "cube",
			"width"  : 5,
			"height" : 5,
			"depth" : 5,
			"widthSegments"  : 10,
			"heightSegments" : 10,
			"depthSegments" : 10
		},
		
		"g_grape": {
			"type"  : "cube",
			"width" : 1,
			"height": 1,
			"depth" : 1,
			"widthSegments"  : 1,
			"heightSegments" : 1,
			"depthSegments"  : 1
		},
		
		"g_sphere": {
			"type"  : "sphere",
			"radius" : 2.5,
			"widthSegments": 128,
			"heightSegments" : 64
        },
		
		"g_sphere2": {
			"type"  : "sphere",
			"radius" : 2.5,
			"widthSegments": 128,
			"heightSegments" : 64
        }
	},

	"embeds": {

	},

	"materials": {

		"basic_gray": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 2236962, "wireframe": true, "opacity": 0.15, "transparent": true }
		},

		"wire_orange": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 10515753, "wireframe": true, "depthWrite": false, "depthTest": false }
		},
        

		"mat_none": {
			"type": "MeshPhongMaterial",
			"parameters": {
				"color": 0,
				"opacity": 0.0,
				"transparent": true
			}
		},

		"m_wire": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 16777215, "wireframe": true, "depthWrite": true, "depthTest": true, "transparent": true, "opacity": 0.2, "blending": "AdditiveBlending" }
		},
        
		"m_plane_basic": {
			"type": "MeshPhysicalMaterial",
			"parameters": {
				"color": 8355711,
				"emissive": 0,
				"emissiveIntensity": 0.0,
				"roughness": 0.25,
				"metalness": 0.0,
				"envMapIntensity": 1.0,
				"reflectivity": 0.5,
				"bumpScale": 0.0,
                "transparent": false,
                "opacity": 1.0
			}
		},
        
		"m_test1": {
			"type": "MeshPhysicalMaterial",
			"parameters": {
				"color": 8355711,
				"emissive": 0,
				"emissiveIntensity": 0.0,
				"roughness": 0.25,
				"metalness": 0.0,
				"envMapIntensity": 1.0,
				"reflectivity": 0.5,
				"bumpScale": 0.0,
                "transparent": false,
                "opacity": 1.0
			}
		},
        
        "mm_01": {
			"type": "MultiMaterial",
			"parameters": { "materials": [ "m_test1", "m_test1", "m_test1", "m_test1" ] }
		}


	},

	"textures": {
        
		
	},

	"fogs":	{
	},

	"defaults": {
		"bgcolor": [0,0,0],
		"bgalpha": 1,
		"camera": "my_camera"
	}

}
