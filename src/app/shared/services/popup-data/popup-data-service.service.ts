import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopupDataService {
  private dataToTransfer: any;

  setIvEncryptedData(data: any) {
    this.dataToTransfer = data;
  }

  getIvEncryptedDataData() {
    const data = this.dataToTransfer;
    this.dataToTransfer = null; // Reset the data after retrieval
    return data;
  }
}
