import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/UploadDocument.css'; 

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [selectedPrinterCoordinates, setSelectedPrinterCoordinates] = useState(null);

  const mapStyles = {
    height: '300px',
    width: '100%',
  };

  const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Coordonnées par défaut (Paris)

  // Chargement des imprimeries depuis le backend
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await axios.get('/api/printers');
        if (Array.isArray(response.data)) {
          setPrinters(response.data);
        } else {
          console.error('Données des imprimeries invalides : ', response.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des imprimeries', error);
      }
    };
    fetchPrinters();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePrinterChange = (e) => {
    const printerId = e.target.value;
    setSelectedPrinter(printerId);
    const printer = printers.find((p) => p._id === printerId);
    if (printer && printer.coordinates) {
      setSelectedPrinterCoordinates({
        lat: printer.coordinates.lat,
        lng: printer.coordinates.lng,
      });
    } else {
      setSelectedPrinterCoordinates(null);
      console.warn("Coordonnées de l'imprimerie non disponibles.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !selectedPrinter) {
      alert('Veuillez sélectionner un fichier et une imprimerie.');
      return;
    }

    // Préparation des données pour l'envoi
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('printerId', selectedPrinter);

    const token = getToken();
    if (!token) {
      console.error('Aucun token trouvé.');
      alert("Erreur d'authentification. Veuillez vous reconnecter.");
      return;
    }

    try {
      // Envoi de la requête POST avec le fichier et les informations de l'imprimerie
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Document envoyé avec succès');
      console.log('Réponse du serveur :', response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi du document", error);
      alert("Erreur lors de l'envoi du document. Veuillez vérifier vos informations.");
    }
  };

  return (
    <div className="upload-container">
      <section className="hero">
        
        <div className="map-container">
          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapStyles}
              zoom={13}
              center={selectedPrinterCoordinates || defaultCenter}
            >
              {selectedPrinterCoordinates && <Marker position={selectedPrinterCoordinates} />}
            </GoogleMap>
          </LoadScript>
        </div>

        <div className="upload-card">
          <h2>Envoyer un Document à Imprimer</h2>

          
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <select
                value={selectedPrinter}
                onChange={handlePrinterChange}
                required
                className="form-control"
              >
                <option value="">Sélectionnez une imprimerie</option>
                {printers.map((printer) => (
                  <option key={printer._id} value={printer._id}>
                    {printer.name || `Imprimerie ID: ${printer._id}`}
                  </option>
                ))}
              </select>
            </div>

            
            <div className="form-group">
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="form-control"
              />
            </div>

           
            <button type="submit" className="btn btn-primary btn-submit">
              Envoyer
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default UploadDocument;
