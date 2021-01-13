import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

  private CARPETA_IMAGENES = 'img';

  constructor( private db: AngularFirestore, private storage: AngularFireStorage) { }

  cargarImagenesFirebase( imagenes: FileItem[] ){

    // console.log( imagenes );

    // const storageRef = firebase.storage().ref();

    for (const item of imagenes) {

      item.estaSubiendo = true;

      if( item.progreso >= 100 ){
        continue;
      }
      const file = item.archivo;
      const filePath = `${ this.CARPETA_IMAGENES }/${ item.nombreArchivo }`;
      const fileRef = this.storage.ref( filePath );
      const uploadTask = this.storage.upload(filePath, file);

      uploadTask.percentageChanges().subscribe( res => item.progreso = res);

      uploadTask.snapshotChanges().pipe(
        finalize(
          () => fileRef.getDownloadURL().subscribe( url => {
            console.log('img cargada con exito');
            item.url = url;
            item.estaSubiendo = false;
            this.guardarImagen({
              nombre: item.nombreArchivo,
              url: item.url
            });

          })
        )
      ).subscribe();
    }

  }

  private guardarImagen ( imagen: { nombre: string, url: string } ){

    this.db.collection(`/${ this.CARPETA_IMAGENES }`)
    .add( imagen );

  }
}
