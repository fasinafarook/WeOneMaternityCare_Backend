interface IFileStorageService{
    uploadFile(file: any, keyPrefix: string): Promise<string>
    uploadFiles(file: any, keyPrefix: string): Promise<string>; // Add this method

}


export default IFileStorageService