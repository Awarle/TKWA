// Home.js
import React, { useState } from 'react';
import axios from 'axios';
import Map from '../components/Map';
import { Regex } from '../components/Regex';
import '../styles/Home.css';

const Home = () => {
  const [postalCode, setPostalCode] = useState('');
  const [printers, setPrinters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction pour gérer la recherche des imprimantes par code postal
  const handleSearch = async () => {
    const postalCodePattern = /^\d{5}$/; // Expression régulière pour un code postal à 5 chiffres

    if (!postalCodePattern.test(postalCode)) {
      setError('Veuillez entrer un code postal valide à 5 chiffres.');
      setPrinters([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log("Recherche pour le code postal:", postalCode);

      // Requête GET au backend
      const response = await axios.get(`/api/printers/search?postalCode=${postalCode}`);
      const data = response.data || [];
      console.log("Imprimantes reçues :", data); // Débogage : affichez les données reçues

      setPrinters(data);

      if (data.length === 0) {
        setError('Aucune imprimerie trouvée pour ce code postal.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
      setError('Erreur lors de la recherche, veuillez réessayer.');
      setPrinters([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <section className="hero">
        {/* Affichage de la carte avec les imprimantes localisées */}
        <div className="map-container">
          <Map printers={printers} />
        </div>

        {/* Barre de recherche et bouton de recherche */}
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Entrez un code postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button" disabled={loading}>
            {loading ? 'Recherche en cours...' : 'Rechercher'}
          </button>
        </div>

        {/* Message d'erreur ou affichage des résultats */}
        {error && <p className="error-message">{error}</p>}
        <div className="results">
          {printers.length > 0 && !error ? (
            printers.map((printer) => (
              <div key={printer._id} className="printer-card">
                <h3>{printer.name}</h3>
                <p>{printer.address}</p>
                <p>Code postal : {printer.postalCode}</p>
              </div>
            ))
          ) : (
            !loading && !error && <p>Aucun résultat</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
