/**
 * Created by Andrei Nadchuk on 03.09.16.
 * email: navikom11@mail.ru
 */

THREE.Preloader = function (webglContainer, options) {

    var camera, scene, renderer, request, container;
    var mesh, ch1, ch2, ch3, loader_ring, plane2;

    this.start = function () {
        container.style.display = '';
        options.wrapper.style.display = 'block';
        if (request)
            cancelAnimationFrame(request);
        animate();
        render();
    };

    this.stop = function () {
        cancelAnimationFrame(request);
        container.style.display = 'none';
        options.wrapper.style.display = "none";
        options.bar.style.width = 10 + "px";
    };

    this.updateProgress = function (progress) {

        var bar = 245,
            total = progress.totalModels + progress.totalTextures,
            loaded = progress.loadedModels + progress.loadedTextures;

        if (total)
            bar = Math.floor(bar * loaded / total);

        if (options.message)
            options.message.innerHTML = Translator.translate('Loading...') + ' ' + Translator.translate('Models') + ' ' + progress.loadedModels + '/' + progress.totalModels + ', textures ' + progress.loadedTextures + '/' + progress.totalTextures;
        options.bar.style.width = bar + "px";
    };

    init();

    function init() {

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 200;
        camera.position.y = 0;
        camera.position.x = 00;
        camera.rotation.y = 0;

        scene = new THREE.Scene();
        scene.add(camera);

        var options = options || '';


        var loader = new THREE.IONLoader();
        loader.load('./css/loader.ion', function (geometry) {

            var loader_mat = new THREE.MeshBasicMaterial({
                "color": 0xFFFFFF,
				"opacity": 0.1,
                //"alphaMap": new THREE.TextureLoader().load('./css/preloader.png'),
                "transparent": true,
                "depthTest": true,
                "depthWrite": true,
                "wireframe": true,
                "blending": THREE.AdditiveBlending
            });

            var mesh1 = new THREE.Mesh(geometry, loader_mat);
            var mesh2 = new THREE.Mesh(geometry, loader_mat);
            var mesh3 = new THREE.Mesh(geometry, loader_mat);
            //	scene.add( mesh );

            var m0 = new THREE.Object3D();
            var p1 = new THREE.Object3D();
            var p2 = new THREE.Object3D();
            var p3 = new THREE.Object3D();
            ch1 = new THREE.Object3D();
            ch2 = new THREE.Object3D();
            ch3 = new THREE.Object3D();
            w1 = new THREE.Object3D();


            w1.add(mesh1);
            ch1.add(mesh1);
            ch2.add(mesh2);
            ch3.add(mesh3);

            p1.add(ch1);
            p2.rotation.z = 2.18;
            p2.add(ch2);
            p3.rotation.z = -2.18;
            p3.add(ch3);


            p2.scale.set(0.1, 0.1, 0.1);
            p3.scale.set(0.1, 0.1, 0.1);

            //m0.add( p1, p2, p3 );

            //m0.rotation.y = 0.15;


            p1.rotation.set(-1.57, 0, 0);
            p1.position.set(0, -20, 0);
            p1.scale.set(1,1,1);

            scene.add(p1);
            //scene.add( w1 );


        });


        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
        //renderer.setClearColor( '#ffff00' );
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        webglContainer.appendChild(renderer.domElement);

        container = renderer.domElement;
        container.style.position = 'absolute';
        container.style.display = 'none';
        container.style.zIndex = 1009;

        //

        window.addEventListener('resize', onWindowResize, false);

        setRelativeViewerContainer();

    }

    function onWindowResize() {

        setRelativeViewerContainer();


    }

    function setRelativeViewerContainer() {

        var top = webglContainer.offsetTop;
        var left = webglContainer.offsetLeft;
        var width = webglContainer.offsetWidth;
        var height = webglContainer.offsetHeight;

        container.style.top = top + 'px';
        container.style.left = left + 'px';
        container.style.width = width;
        container.style.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

    }

    function animate() {
        request = requestAnimationFrame(animate);

        if (!ch1) return;
        ch1.rotation.z += 0.01;
        ch2.rotation.y += 0.07;
        ch3.rotation.y += 0.075;
        //ch1.rotation.x += 0.0065;
        ch2.rotation.x += 0.007;
        ch3.rotation.x += 0.0075;

        render();

    }

    function render() {
        renderer.clear();
        renderer.render(scene, camera);
    }


};