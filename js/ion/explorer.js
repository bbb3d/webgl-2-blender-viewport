function IonSceneExplorer(viewer, scene_contents) {
    this.viewer = viewer;
    this.contents = scene_contents;
}

IonSceneExplorer.prototype = {
    constructor: IonSceneExplorer,

    init: function() {
        var _this = this;

        this.container = $c('div');
        this.container.id = 'scene-explorer';

        this.viewer.container.appendChild(this.container);

        var res =
            '<ul>' +
                '<li>cameras' +
                    '<ul>';

        for (var cam_name in this.contents.cameras) {
            res += '<li class="cam" data-target="' + cam_name + '">' + cam_name +'</li>'
        }

        res +=
                    '</ul>' +
                '</li>' +
                '<li>lights' +
                    '<ul>';

        for (var light_name in this.contents.lights) {
            res += '<li>' + light_name + '</li>'
        }

        res +=
                    '</ul>' +
                '</li>' +
                '<li>materials' +
                    '<ul>';

        for (var mat_name in this.contents.materials) {
            res += '<li>' + mat_name + '</li>'
        }

        res +=
                    '</ul>' +
                '</li>' +
                '<li>textures' +
                    '<ul>';

        for (var tx_name in this.contents.textures) {
            res += '<li>' + tx_name + '</li>'
        }

        res +=
                    '</ul>' +
                '</li>' +
                '<li>objects' +
                    '<ul>';

        for (var obj_name in this.contents.objects) {
            res += '<li>' + obj_name + '</li>'
        }

        res +=
                    '</ul>' +
                '</li>' +
                '<li>geometries' +
                    '<ul>';

        for (var geo_name in this.contents.geometries) {
            res += '<li>' + geo_name + '</li>'
        }

        res +=
                    '</ul>' +
                '</li>' +
            '</ul>';
        this.container.innerHTML = res;

        var cam_links = this.container.getElementsByClassName('cam');
        for (var i = 0; i < cam_links.length; i++) {
            var cam_link = cam_links[i];
            cam_link.addEventListener('click', function() {
                var cam_name = this.getAttribute('data-target');
                _this.viewer.switchCamera(cam_name);

                return false;
            });
        }

    }

}

////THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
////    console.log( item, loaded, total );
////};
////
////init();
////animate();
////
////function $( id ) {
////    return document.getElementById( id );
////}
//
//function handle_update( result, pieces ) {
//    refreshSceneView( result );
//
//    var m, material, count = 0;
//
//    for ( m in result.materials ) {
//        material = result.materials[ m ];
//        if ( ! ( material instanceof THREE.MeshFaceMaterial || material instanceof THREE.ShaderMaterial || material.morphTargets ) ) {
//            if( !material.program ) {
//                renderer.initMaterial( material, result.scene.__lights, result.scene.fog );
//
//                count += 1;
//                if( count > pieces ) {
//                    break;
//                }
//            }
//        }
//    }
//}
//
////function init() {
////    var loadScene = createLoadScene();
////
////    camera = loadScene.camera;
////    scene = loadScene.scene;
////
////    renderer = new THREE.WebGLRenderer( { antialias: true } );
////
////    $( "start" ).addEventListener( 'click', onStartClick, false );
////
//////    var callbackProgress = function( progress, result ) {
//////        var bar = 250,
//////            total = progress.totalModels + progress.totalTextures,
//////            loaded = progress.loadedModels + progress.loadedTextures;
//////
//////        if ( total )
//////            bar = Math.floor( bar * loaded / total );
//////
//////        $( "bar" ).style.width = bar + "px";
//////
//////        count = 0;
//////        for ( var m in result.materials ) count++;
//////
//////        handle_update( result, Math.floor( count/total ) );
//////    }
////
////    var callbackFinished = function ( result ) {
////        loaded = result;
////
////        handle_update( result, 1 );
////    }
////
////    $( "progress" ).style.display = "block";
////
////    var loader = new THREE.SceneLoader();
////
////    loader.callbackProgress = callbackProgress;
////
////    loader.load( "scene/d17_scene_v2.js", callbackFinished );
////
////    $( "plus_exp" ).addEventListener( 'click', createToggle( "exp" ), false );
////}
//
//function onStartClick() {
//    camera = loaded.currentCamera;
//    scene = loaded.scene;
//}
//
////function createLoadScene() {
////    var result = {
////        scene:  new THREE.Scene(),
////        camera: new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 1000 )
////    };
////
////    result.camera.position.z = 100;
////    result.scene.add( result.camera );
////
////    var object, geometry, material, light, count = 500, range = 200;
////
////    material = new THREE.MeshLambertMaterial( { color:0xffffff } );
////    geometry = new THREE.CubeGeometry( 5, 5, 5 );
////
////    for( var i = 0; i < count; i++ ) {
////
////        object = new THREE.Mesh( geometry, material );
////
////        object.position.x = ( Math.random() - 0.5 ) * range;
////        object.position.y = ( Math.random() - 0.5 ) * range;
////        object.position.z = ( Math.random() - 0.5 ) * range;
////
////        object.rotation.x = Math.random() * 6;
////        object.rotation.y = Math.random() * 6;
////        object.rotation.z = Math.random() * 6;
////
////        object.matrixAutoUpdate = false;
////        object.updateMatrix();
////
////        result.scene.add( object );
////
////    }
////
////    result.scene.matrixAutoUpdate = false;
////
////    light = new THREE.PointLight( 0xffffff );
////    result.scene.add( light );
////
////    light = new THREE.DirectionalLight( 0x111111 );
////    light.position.x = 1;
////    result.scene.add( light );
////
////    return result;
////}
//
//function animate() {
//    requestAnimationFrame( animate );
//
//    render();
//    stats.update();
//}
//
//function render() {
//    for ( var i = 0; i < morphAnimatedObjects.length; i ++ ) {
//        var object = morphAnimatedObjects[ i ];
//        object.updateAnimation( 1000 * delta );
//    }
//    renderer.render( scene, camera );
//}
//
//// Scene explorer user interface
//
//function toggle( id ) {
//    var scn = $( "section_" + id ).style,
//        btn = $( "plus_" + id );
//
//    if ( scn.display == "block" ) {
//        scn.display = "none";
//        btn.innerHTML = "[+]";
//
//    } else {
//        scn.display = "block";
//        btn.innerHTML = "[-]";
//    }
//}
//
//function createToggle( label ) {
//    return function() {
//        toggle( label )
//    }
//};
//
//function refreshSceneView( result ) {
//    $( "section_exp" ).innerHTML = generateSceneView( result );
//
//    var config = [ "obj", "geo", "mat", "tex", "lit", "cam" ];
//
//    for ( var i = 0; i < config.length; i++ )
//        $( "plus_" + config[i] ).addEventListener( 'click', createToggle( config[i] ), false );
//}
//
//function generateSection( label, id, objects ) {
//    var html = "";
//
//    html += "<h3><a id='plus_" + id + "' href='#'>[+]</a> " + label + "</h3>";
//    html += "<div id='section_" + id + "' class='part'>";
//
//    for( var o in objects ) {
//
//        html += o + "<br/>";
//
//    }
//    html += "</div>";
//
//    return html;
//}
//
//function generateSceneView( result ) {
//    var config = [
//        [ "Objects",    "obj", result.objects ],
//        [ "Geometries", "geo", result.geometries ],
//        [ "Materials",  "mat", result.materials ],
//        [ "Textures",   "tex", result.textures ],
//        [ "Lights",     "lit", result.lights ],
//        [ "Cameras",    "cam", result.cameras ]
//    ];
//
//    var html = "";
//
//    for ( var i = 0; i < config.length; i++ )
//        html += generateSection( config[i][0], config[i][1], config[i][2] );
//
//    return html;
//}
