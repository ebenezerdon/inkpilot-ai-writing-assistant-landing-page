// helpers.js - small utility functions and storage wrapper
// Expose under window.App.Helpers and window.App.Storage to avoid global collisions
(function(window, $){
  window.App = window.App || {};
  window.App.Helpers = window.App.Helpers || {};

  // Format price based on billing cycle
  window.App.Helpers.formatPrice = function(amount, billing){
    if (billing === 'annual'){
      return '$' + amount + "/yr";
    }
    return '$' + amount + '/mo';
  };

  // Simple DOM-safe text escape (used rarely)
  window.App.Helpers.escapeHtml = function(str){
    return String(str).replace(/[&<>"']/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[ch];
    });
  };

  // Clipboard helper using modern API and fallback
  window.App.Helpers.copyToClipboard = function(text){
    return new Promise(function(resolve, reject){
      if (!text) { reject(new Error('Empty text')); return; }
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(resolve).catch(function(){
          // fallback
          try {
            const ta = document.createElement('textarea');
            ta.value = text; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px';
            document.body.appendChild(ta);
            ta.select(); document.execCommand('copy'); document.body.removeChild(ta); resolve();
          } catch (e) { reject(e); }
        });
      } else {
        try {
          const ta = document.createElement('textarea');
          ta.value = text; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px';
          document.body.appendChild(ta);
          ta.select(); document.execCommand('copy'); document.body.removeChild(ta); resolve();
        } catch (e) { reject(e); }
      }
    });
  };

  // Small prefers-reduced-motion checker
  window.App.Helpers.prefersReducedMotion = function(){
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch(e){ return false; }
  };

  // Storage wrapper stored under window.App.Storage
  window.App.Storage = window.App.Storage || (function(){
    var prefix = 'inkpilot_v1_';
    return {
      save: function(key, value){
        try{ localStorage.setItem(prefix + key, JSON.stringify(value)); return true; }catch(e){ return false; }
      },
      load: function(key, fallback){
        try{
          var raw = localStorage.getItem(prefix + key);
          if (!raw) return fallback === undefined ? null : fallback;
          return JSON.parse(raw);
        }catch(e){ return fallback === undefined ? null : fallback; }
      },
      remove: function(key){
        try{ localStorage.removeItem(prefix + key); return true;}catch(e){return false;}
      }
    };
  }());

})(window, jQuery);
