(() => {
    let Component = (props) => {
        function getFileUpload() {
            return new Promise((resolve, reject) => {
                let fileEl = document.createElement('input');
                fileEl.type = 'file';
                fileEl.onchange = () => {
                    console.log(fileEl.files);
                    resolve(fileEl.files[0])
                };
                fileEl.click();
            });
        }
        // let steps = { 1: 'upload', 2.5: 'processing-1', 2: 'edit', 3: 'save' }
        let { children } = props || {};
        let [editFile, setEditFile] = useState({ file: null, step: 1 });
        if (editFile.step == 1)
            return <div className="p-4 flex flex-col items-center h-full">
                <div className="cursor-pointer p-4 border rounded-xl shadow-md flex flex-col items-center w-full aspect-video"
                    onClick={async () => setEditFile({ ...editFile, file: await getFileUpload(), step: 2 })}>

                    {editFile.file ?
                        <img className="w-full h-full aspect-video object-contain" src={URL.createObjectURL(editFile.file)} alt="" />
                        :
                        <>
                            <i className="fi fi-rr-picture text-8xl p-2 rounded"></i>
                            <div className="text-xl font-bold">Pick an image</div>
                        </>
                    }
                </div>
            </div>;
        if (editFile.step == 2) {
            return <RealtimeComponent imageFile={editFile.file} path={properPath('components/edit.jsx')} />
        }
    }

    return Component;
})()