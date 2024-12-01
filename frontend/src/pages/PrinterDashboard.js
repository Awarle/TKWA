import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { getToken } from '../utils/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/PrinterDashboard.css';

const PrinterDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/api/documents/printer', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        console.log("Documents récupérés :", response.data);
        setDocuments(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des documents', error);
        setError("Erreur lors de la récupération des documents.");
      }
    };

    fetchDocuments();
  }, []);

  const handlePrint = async (documentId) => {
    try {
      await axios.put(
        `/api/documents/${documentId}/status`,
        { status: 'Imprimé' },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc._id === documentId ? { ...doc, status: 'Imprimé' } : doc
        )
      );
      setMessage("Statut du document mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du document", error);
      setError("Erreur lors de la mise à jour du statut du document.");
    }
  };

  const handleDownloadAndPrint = async (documentId) => {
    try {
      const response = await axios.get(`/api/documents/file/${documentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'arraybuffer',
      });

      const pdfData = response.data;
      const base64Data = window.btoa(
        String.fromCharCode(...new Uint8Array(pdfData))
      );

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
        <head><title>Document à Imprimer</title></head>
        <body>
          <iframe width="100%" height="100%" src="data:application/pdf;base64,${base64Data}"></iframe>
          <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
      `);
      printWindow.document.close();

      await handlePrint(documentId);

      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc._id !== documentId)
      );

      setMessage("Document imprimé et supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors du téléchargement ou de l'impression du document", error);
      setError("Erreur lors du téléchargement ou de l'impression du document.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address || !postalCode || !lat || !lng) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      await axios.put(
        '/api/printer/update-address',
        {
          address,
          postalCode,
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setMessage("Adresse et coordonnées mises à jour avec succès !");
      setError('');
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'adresse", error);
      setError("Erreur lors de la mise à jour de l'adresse.");
      setMessage('');
    }
  };

  return (
    <div className="printer-dashboard-container">
      <div className="bg-image">
        <div className="content-wrapper">
          <div className="dashboard-card">
            <h2 className="text-center mb-4">Documents à Imprimer</h2>
            {message && <p className="text-success">{message}</p>}
            {error && <p className="text-danger">{error}</p>}

            <ul className="list-group mb-4">
              {documents.map((doc) => (
                <li
                  key={doc._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>Nom du fichier:</strong> {doc.fileName} -{' '}
                    <strong>Utilisateur:</strong> {doc.userId} -{' '}
                    <strong>État:</strong> {doc.status}
                  </div>
                  <div>
                    <button
                      onClick={() => handlePrint(doc._id)}
                      disabled={doc.status === 'Imprimé'}
                      className="btn btn-sm btn-success me-2"
                    >
                      {doc.status === 'Imprimé' ? 'Imprimé' : 'Mettre à jour le statut'}
                    </button>
                    <button
                      onClick={() => handleDownloadAndPrint(doc._id)}
                      className="btn btn-sm btn-primary"
                    >
                      Télécharger et Imprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <h2 className="text-center mb-4">Mettre à jour l'adresse de l'imprimerie</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Adresse :</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Saisissez l'adresse"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Code Postal :</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Saisissez le code postal"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Latitude :</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Saisissez la latitude"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Longitude :</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Saisissez la longitude"
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Mettre à jour
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterDashboard;
