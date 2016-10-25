(function() {
	if (!tinymce.Env.fileApi) {
		return;
	}

	module("tinymce.plugins.ImageTools", {
        setup: function() {
            document.getElementById('view').innerHTML = '<textarea></textarea>';
        },

		teardown: function() {
			var ed, win;
            win = Utils.getFrontmostWindow();
			if (win) {
				win.close();
			}

            while ((ed = tinymce.editors.pop())) {
                ed.remove();
            }
		}
	});

    function loadTiny(options, cb) {
        tinymce.init(tinymce.extend({
            selector: 'textarea',
            plugins: "image imagetools",
            init_instance_callback: function(ed) {
                var img;
                img = new Image();
                img.onload = function() {
                    ed.setContent('<p><img src="manual/img/dogleft.jpg" /></p>');
                    if (typeof cb == 'function') {
                        cb();
                    }
                };
                img.src = "manual/img/dogleft.jpg";

                window.editor = ed;
            }
        }, options));
    }

    asyncTest('images_reuse_filename:false - upload is submitted with unique filename each time', function() {
        function finalize(id) {
            QUnit.start();
            ok((new RegExp(id + '\.(png|jpg|jpeg|gif)$')).test(editor.$('img').attr('src')));
        }
        
        loadTiny({
            automatic_uploads: true,
            images_upload_timeout: 1,
            images_upload_url: 'postAcceptor.php',
            images_upload_handler: function(blobInfo, success) {
                notEqual(blobInfo.filename(), 'dogleft.png');
                setTimeout(function() {
                    finalize(blobInfo.id());
                }, 1);
                success(blobInfo.filename());
            }
        }, function() {
            Utils.setSelection('img', 0);
            editor.execCommand('mceImageFlipHorizontal');
        });
	});


    asyncTest('images_reuse_filename:true - upload is submitted with original filename', function() {
        function finalize() {
            QUnit.start();
            ok(/dogleft\.png\?\d+$/.test(editor.$('img').attr('src')));
        }
        
        loadTiny({
            automatic_uploads: true,
            images_reuse_filename: true,
            images_upload_timeout: 1,
            images_upload_url: 'postAcceptor.php',
            images_upload_handler: function(blobInfo, success) {
                equal(blobInfo.filename(), 'dogleft.png');
                setTimeout(finalize, 1);
                success('dogleft.png');
            }
        }, function() {
            Utils.setSelection('img', 0);
            editor.execCommand('mceImageFlipHorizontal');
        });
	});

}());