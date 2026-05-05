// src/tools/weather.js
// Outil météo — données temps réel via wttr.in (gratuit, sans clé API)

/**
 * Récupère la météo actuelle d'une ville.
 * @param {{ city: string }} params
 * @returns {Promise<Object>} météo ou { error: string }
 */
export async function get_weather({ city }) {
  try {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'mini-perplexity/1.0' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const cc = data.current_condition[0];

    return {
      city,
      temperature_c: parseInt(cc.temp_C),
      feels_like_c: parseInt(cc.FeelsLikeC),
      description: cc.weatherDesc[0].value,
      humidity: parseInt(cc.humidity),
      wind_kmph: parseInt(cc.windspeedKmph),
    };
  } catch (e) {
    return { error: `Impossible de récupérer la météo pour "${city}" : ${e.message}` };
  }
}

// Définition de l'outil pour Mistral
export const weatherTool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description:
      'Retourne la météo actuelle (température, ressenti, description, humidité, vent) ' +
      "pour une ville donnée. À utiliser dès qu'on demande le temps qu'il fait quelque part.",
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'Nom de la ville en anglais ou français. Ex : "Paris", "London", "Tokyo"',
        },
      },
      required: ['city'],
    },
  },
};