import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [progress, setProgress] = useState(0);

  const fetchFileList = async () => {
    try {
      const result = await fetch(`${API_BASE}/files/db`);
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'Could not load files');
      setFiles(data.files || []);
      setStatus(`Loaded ${data.count || 0} files.`);
      setStatusType('success');
    } catch (error) {
      setStatus('Load failure: ' + error.message);
      setStatusType('error');
    }
  };

  useEffect(() => {
    fetchFileList();
  }, []);

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setStatus('Please choose files to upload.');
      setStatusType('error');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        setStatus('Upload successful');
        setStatusType('success');
        setSelectedFiles([]);
        setProgress(0);
        await fetchFileList();
      } else {
        setStatus('Upload failed: ' + xhr.responseText);
        setStatusType('error');
      }
    };

    xhr.onerror = () => {
      setStatus('Network upload error');
      setStatusType('error');
    };

    xhr.send(formData);
    setStatus('Uploading...');
    setStatusType('');
  };

  const deleteFile = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      const result = await fetch(`${API_BASE}/files/db/${id}`, { method: 'DELETE' });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'Delete failed');
      setStatus('Deleted file');
      setStatusType('success');
      fetchFileList();
    } catch (error) {
      setStatus('Delete failed: ' + error.message);
      setStatusType('error');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Audio App React</h1>

      <div style={{ marginBottom: 20, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 0 10px rgba(0,0,0,0.06)' }}>
        <input type="file" multiple onChange={handleFileSelect} />
        <button onClick={handleUpload} style={{ marginLeft: 12 }}>Upload</button>

        <div style={{ marginTop: 10 }}>
          {selectedFiles.length === 0
            ? 'No files selected.'
            : selectedFiles.map((f) => <div key={f.name}>{f.name} ({(f.size / 1024).toFixed(1)} KB)</div>)}
        </div>

        <progress value={progress} max="100" style={{ width: '100%', marginTop: 8, display: progress > 0 ? 'block' : 'none' }} />
      </div>

      <p style={{ color: statusType === 'error' ? '#b00020' : '#00772c' }}>{status}</p>

      <button onClick={fetchFileList}>Refresh File List</button>

      <div style={{ marginTop: 20, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 0 10px rgba(0,0,0,0.06)' }}>
        <h2>Uploaded Files</h2>
        {files.length === 0 ? (
          <p>No files</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map((file) => (
              <li key={file._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span>
                  {file.originalname} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <span>
                  <a href={`${API_BASE}/upload/${file.path}`} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>
                    Open
                  </a>
                  <button onClick={() => deleteFile(file._id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
