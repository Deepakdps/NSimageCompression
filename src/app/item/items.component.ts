import { Component, OnInit } from '@angular/core';

import { Item } from './item';
import { ItemService } from './item.service';
import * as imagepicker from 'nativescript-imagepicker';
import * as camera from 'nativescript-camera';
import { ImageAsset } from 'tns-core-modules/image-asset';
import { Image } from 'tns-core-modules/ui/image';
import { ImageSource, fromFile } from 'tns-core-modules/image-source';

@Component({
    selector: 'ns-items',
    moduleId: module.id,
    templateUrl: './items.component.html'
})
export class ItemsComponent {
    isBusy: boolean = false;
    index;
    imgArray: any = [];
    cameraImage: ImageAsset;

    imageAssets = [];
    imageSrc: any;
    isSingleMode: boolean = true;
    previewSize: number = 600;

    uploadFromgallery() {
        let context = imagepicker.create({
            mode: 'single'
        });
        this.startSelection(context);
    }
    private startSelection(context) {
        context
            .authorize()
            .then(() => {
                this.imageAssets = [];
                this.imageSrc = null;
                return context.present();
            })
            .then(selection => {
                this.index = this.imgArray.length;
                selection.forEach(select => {
                    this.imageSrc = select;

                    let options = {
                        width: this.previewSize,
                        heigth: this.previewSize
                    };
                    this.imageSrc.options = options;
                    this.imageSrc.keepAspectRatio = false;
                    this.cameraImage = this.imageSrc;
                    this.imgArray.push({
                        imageurl: '',
                        uploaded: false,
                        url: '',
                        name: '',
                        tag: '',
                        thumburl: ''
                    });
                    this.imageUpload(
                        select._android,
                        this.cameraImage,
                        'fromGallery'
                    );
                });
            })
            .catch(function(e) {
                console.log('catch gallery', e);
            });
    }
    uploadFromCamera() {
        var options = {
            width: 300,
            height: 300,
            keepAspectRatio: false,
            saveToGallery: true
        };
        camera
            .requestPermissions()
            .then(() =>
                camera
                    .takePicture(options)
                    .then(imageAsset => {
                        this.cameraImage = imageAsset;
                        var image = new Image();
                        image.src = imageAsset;
                        imageAsset.getImageAsync(imagesource => {
                            let localPath = imageAsset.android;

                            this.index =
                                this.imgArray.push({
                                    imageurl: '',
                                    uploaded: false,
                                    url: '',
                                    name: '',
                                    tag: '',
                                    thumburl: ''
                                }) - 1;

                            this.imageUpload(
                                localPath,
                                this.cameraImage,
                                'fromCamera'
                            );
                        });
                    })
                    .catch(function(e) {
                        console.log('catch in camera', e);
                    })
            )
            .catch(function(e) {
                console.log(e);
            });
    }

    private imageUpload(image, photoImage, fromWhere) {
        var imageFromLocalFile: ImageSource = <ImageSource>fromFile(image);
        var b64 = imageFromLocalFile.toBase64String('jpg', 90);
        var fileSize = b64.replace(/\=/g, '').length * 0.75;
        console.log('filesize', fileSize); //file size before compression
        if (Math.round(fileSize).toString().length > 4) {
            imageFromLocalFile.loadFromBase64(b64);
            var saved = imageFromLocalFile.saveToFile(image, 'jpg', 10);
        }

        console.log('saved status', saved);
        var imageFromLocalFile: ImageSource = <ImageSource>fromFile(image);
        var b64 = imageFromLocalFile.toBase64String('jpg');
        var fileSize = b64.replace(/\=/g, '').length * 0.75;
        console.log('filesize after', fileSize); //file size after compression

        this.imgArray[this.index].uploaded = true;

        this.imgArray[this.index].imageurl = photoImage;

        this.index++;
    }
}
