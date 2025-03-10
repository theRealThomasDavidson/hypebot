// First, load the stable polyfills
import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie11';

// Then load core-js polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Import fetch polyfill
import 'whatwg-fetch';

// Initialize global polyfills
if (typeof window !== 'undefined') {
  // Promise polyfill
  if (!window.Promise) {
    window.Promise = require('core-js/features/promise');
  }

  // Symbol polyfill
  if (!window.Symbol) {
    window.Symbol = require('core-js/features/symbol');
  }

  // Collection polyfills
  if (!window.Set) {
    window.Set = require('core-js/features/set');
  }

  if (!window.Map) {
    window.Map = require('core-js/features/map');
  }

  // Ensure process is defined
  if (!window.process) {
    window.process = require('process');
  }
} 