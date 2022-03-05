function IonMouseControl(viewer, options) {
    var options = options || {};

    this.viewer = viewer;
    this.container = this.viewer.container;
    this.document = document;
    this.window = window;

    this.options = extend({}, this.defaults, options);

    this.init();
}

IonMouseControl.prototype = {
    constructor: IonMouseControl,

    // options
    defaults: {
        debug: false,
        sensitivity: 0.005,
        zoom_sensitivity: 1.2
    },

    // values
    default: {
        rotate: {
            left: 0,
            up: 0
        },
        zoom: 35
    },

    current: {},
    rotate_start: {},

    events: {
        container: {
            mousedown: function(e) {
                if (e.button == 0) {
                    this.startDrag(e);
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            click: function(e) {
                this.log('cont click');

                if (this.changed && !this.dragged) {
                    this.reset(e);
                }

                // this event happens after every mouseup... I fucking hope it won't change
                this.dragged = false;
                e.stopPropagation();
            },
            mousewheel: function(e) {
                // Chrome
                var delta = e.deltaY / Math.abs(e.deltaY);
                this.zoom(delta);
            },
            DOMMouseScroll: function(e) {
                // FF
                var delta = e.detail / Math.abs(e.detail);
                this.zoom(delta);
            }
        },
        document: {
            mousedown: function(e) {
                this.log('doc mousedown');
                if (this.changed && !this.dragged) {
                    this.reset(e);
                }
            },
            mousemove: function(e) {
                if (this.dragging) {
                    this.drag(e);
                }
            },
            mouseup: function(e) {
                if (e.button == 0 && this.dragging) {
                    this.stopDrag();
                }
            },
            mouseout: function(e) {
                var from = e.relatedTarget || e.toElement;
                if (!from || from.nodeName == "HTML") {
                    this.log('window mouseout')
                    if (this.dragging) {
                        this.stopDrag();
                    }
                }

            }
        },
        window: {

        }
    },

    log: function() {
        if (this.options.debug && window.console) {
            console.log(Array.prototype.slice.call(arguments));
        }
    },

    init: function() {
        this.viewer.cam_group.rotation.order = 'YXZ';

        this.resetCurrent();

        this.attachEvents();
    },

    resetCurrent: function() {
        extend(this.current, this.default);
    },

    attachEvents: function() {
        for (var obj_name in this.events) {
            var obj = this[obj_name],
                events = this.events[obj_name];

            for (var evt_name in events) {
                var cb = events[evt_name];

                this.attachEvent(obj, evt_name, cb);
            }
        }
    },

    attachEvent: function(obj, evt_name, callback) {
        var _this = this;

        obj.addEventListener(evt_name, function(e) {
            return callback.call(_this, e);
        });
    },

    startDrag: function(e) {
        this.dragging = true;
        this.drag_start = {x: e.clientX, y: e.clientY};
        extend(this.rotate_start, this.current.rotate);
        this.log('drag start');
    },

    stopDrag: function() {
        this.dragging = false;
        this.log('drag stop');
    },

    drag: function(e) {
        var m = {x: e.clientX, y: e.clientY};

        this.current.rotate.up   = this.rotate_start.up   - (m.y - this.drag_start.y) * this.options.sensitivity;
        this.current.rotate.left = this.rotate_start.left - (m.x - this.drag_start.x) * this.options.sensitivity;

        this.normalize();
        this.setRotation();

        this.dragged = true; // detect drag/click
        this.changed = true;
    },

    normalize: function() {
        if (this.current.rotate.left < -Math.PI) {
            this.current.rotate.left += Math.PI * 2;
        }

        if (this.current.rotate.left > Math.PI) {
            this.current.rotate.left -= Math.PI * 2;
        }

        if (this.current.rotate.up < -Math.PI) {
            this.current.rotate.up += Math.PI * 2;
        }

        if (this.current.rotate.up > Math.PI) {
            this.current.rotate.up -= Math.PI * 2;
        }
    },

    // delta = 1 | -1
    zoom: function(delta) {
        this.log('zoom', delta);

        this.changed = true;

        if (delta > 0) {
            this.current.zoom = this.current.zoom * this.options.zoom_sensitivity
        } else {
            this.current.zoom = this.current.zoom / this.options.zoom_sensitivity
        }

        this.setZoom();
    },

    reset: function(e) {
        this.log('ctr reset');

        this.resetCurrent();
        this.setRotation(true);
        this.setZoom();

        this.changed = false;
    },

    setRotation: function(animate) {
        if (animate) {
            this.viewer.animateParamTo('cam rotation', this.viewer.cam_group.rotation, {x: this.current.rotate.up, y: this.current.rotate.left, z: 0}, 1000, easeOutCubic);
        } else {
            this.viewer.cam_group.rotation.set(this.current.rotate.up, this.current.rotate.left, 0);
            this.viewer.requestRender();
        }
    },

    setZoom: function() {
        this.viewer.animateParamTo('fov', this.viewer.camera, {fov: this.current.zoom}, 1000, easeOutCubic);
    }
}
