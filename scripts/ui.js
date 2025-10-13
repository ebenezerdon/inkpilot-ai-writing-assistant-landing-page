/* ui.js - builds App.init and App.render on window.App
   Responsibilities: wire all UI interactions (demos, templates, pricing toggle, FAQ), restore/persist state, and handle modal. */
(function(window, $){
  window.App = window.App || {};

  // demo examples used to generate quick outputs for the landing page
  var demoResponses = {
    subject: function(input){
      var base = input || 'Your product';
      return [
        base + ': New feature that boosts conversions',
        'How ' + base + ' helped teams grow 3x',
        'Stop losing customers — try ' + base,
        'Why ' + base + ' is the only tool you need',
        'A quick win with ' + base
      ];
    },
    hero: function(input){
      var base = input || 'your product';
      return [
        'Make ' + base + ' effortless — delight users and ship faster.',
        'Create beautiful ' + base + ' in minutes, not days.',
        'Turn ' + base + ' into measurable growth.'
      ];
    },
    email: function(input){
      var base = input || 'prospect';
      return [
        'Hi ' + base + ', quick idea that can help reduce churn by 20%.',
        'Hey ' + base + ', noticed you using X — we helped similar teams scale.',
        'Hello ' + base + ', got 30 seconds? I have one idea to boost conversions.'
      ];
    }
  };

  // Default templates store
  var templates = {
    'hero-hero': {
      id:'hero-hero', title:'Hero Headline (Short)', text:'Save time. Ship better copy. Grow faster.', tags:['marketing']
    },
    'subject-line':{
      id:'subject-line', title:'Subject Line Formula', text:'Get 2x more opens — with personalized subject lines', tags:['marketing','email']
    },
    'cold-email':{
      id:'cold-email', title:'Cold Email Opener', text:'Hi {name}, saw {signal} — we helped {similar} cut onboarding time by 30%.', tags:['sales','email']
    }
  };

  // Helpers for DOM updates
  function updateSavedCount(){
    var saved = window.App.Storage.load('saved_templates', []);
    $('#saved-count').text((saved && saved.length) ? saved.length : 0);
  }

  function renderTemplates(filter){
    filter = filter || 'all';
    var container = $('#templates-grid');
    container.empty();
    var saved = window.App.Storage.load('saved_templates', []);
    Object.keys(templates).forEach(function(key){
      var t = templates[key];
      if (filter !== 'all' && (t.tags || []).indexOf(filter) === -1) return;
      var savedFlag = saved.indexOf(t.id) !== -1;
      var card = $(
        `<article class="card" data-template-id="${t.id}">
          <h3 class="font-semibold">${window.App.Helpers.escapeHtml(t.title)}</h3>
          <p class="text-sm text-gray-500 mt-1">${window.App.Helpers.escapeHtml((t.tags || []).join(', '))}</p>
          <pre class="mt-3 text-sm bg-gray-50 p-3 rounded-md">${window.App.Helpers.escapeHtml(t.text)}</pre>
          <div class="mt-3 flex gap-2">
            <button class="btn-primary copy-template" data-template-id="${t.id}">Copy</button>
            <button class="btn-ghost save-template" data-template-id="${t.id}">${savedFlag ? 'Unsave' : 'Save'}</button>
          </div>
        </article>`
      );
      container.append(card);
    });
    updateSavedCount();
  }

  function showModal(html){
    $('#modal-body').html(html);
    $('#modal').removeClass('hidden');
    // accessible focus trap (simple)
    $('#modal').attr('tabindex','-1').focus();
  }

  function closeModal(){
    $('#modal').addClass('hidden');
    $('#modal-body').empty();
  }

  // Primary public methods
  window.App.init = function(){
    try{
      // Restore year in footer
      $('#year').text(new Date().getFullYear());

      // Mobile menu toggle
      $('#mobile-toggle').on('click', function(){
        var expanded = $(this).attr('aria-expanded') === 'true';
        $(this).attr('aria-expanded', (!expanded).toString());
        $('#mobile-menu').toggleClass('hidden');
      });

      // Quick tour button shows a small modal with highlights
      $('#play-tour').on('click', function(){
        showModal(`
          <h4 class=\"font-semibold\">Quick tour</h4>
          <p class=\"mt-2 text-sm text-gray-700\">Try demos, copy templates, and toggle pricing to see monthly vs annual. Saved templates are stored locally in your browser.</p>
        `);
      });

      $('#modal, #modal-close, #modal-close-2').on('click', function(e){
        // close when clicking background or close buttons
        if (e.target === this || $(this).is('#modal-close') || $(this).is('#modal-close-2')) closeModal();
      });

      $('#modal-copy').on('click', function(){
        var html = $('#modal-body').text();
        window.App.Helpers.copyToClipboard(html).then(function(){
          alert('Copied to clipboard');
        }).catch(function(){ alert('Copy failed'); });
      });

      // Run demo actions (buttons)
      $(document).on('click', '.run-demo', function(){
        var demo = $(this).data('demo');
        var input = $(`.demo-input[data-demo=\"${demo}\"]`).val() || '';
        try{
          var responses = demoResponses[demo] ? demoResponses[demo](input) : ['No demo available.'];
          var html = '<div class="space-y-2">';
          responses.forEach(function(r, i){
            html += `<div class=\"p-3 bg-gray-50 rounded-md\"><div class=\"font-medium\">Suggestion ${i+1}</div><div class=\"text-sm text-gray-700 mt-1\">${window.App.Helpers.escapeHtml(r)}</div></div>`;
          });
          html += '</div>';
          // Show modal with results
          showModal(html);
          // Also set the inline output area for the demo
          $(`[data-output-for=\"${demo}\"]`).html(`<div class=\"text-sm text-gray-800\">${window.App.Helpers.escapeHtml(responses[0])}</div>`);
          // persist last demo and input
          window.App.Storage.save('last_demo', { demo: demo, input: input, output: responses[0] });
        }catch(e){
          console.error('Demo failed', e);
          alert('Sorry, the demo failed.');
        }
      });

      // Quick copy best suggestion button
      $(document).on('click', '[data-copy-example]', function(){
        var demo = $(this).data('demo');
        var last = window.App.Storage.load('last_demo', null);
        var toCopy = '';
        if (last && last.demo === demo && last.output){
          toCopy = last.output;
        } else {
          var responses = demoResponses[demo] ? demoResponses[demo]('') : [];
          toCopy = responses.length ? responses[0] : '';
        }
        window.App.Helpers.copyToClipboard(toCopy).then(function(){
          alert('Copied best suggestion');
        }).catch(function(){ alert('Copy failed'); });
      });

      // Template copy and save
      $(document).on('click', '.copy-template', function(){
        var id = $(this).data('template-id');
        var t = templates[id];
        if (!t){ alert('Template not found'); return; }
        window.App.Helpers.copyToClipboard(t.text).then(function(){
          alert('Template copied');
        }).catch(function(){ alert('Copy failed'); });
      });

      $(document).on('click', '.save-template', function(){
        var id = $(this).data('template-id');
        var saved = window.App.Storage.load('saved_templates', []);
        if (!saved) saved = [];
        var i = saved.indexOf(id);
        if (i === -1){ saved.push(id); $(this).text('Unsave'); }
        else { saved.splice(i,1); $(this).text('Save'); }
        window.App.Storage.save('saved_templates', saved);
        updateSavedCount();
      });

      // template filter
      $('#template-filter').on('change', function(){ renderTemplates($(this).val()); });

      // Pricing toggle
      var billing = window.App.Storage.load('billing', 'monthly');
      setBilling(billing);
      $('#billing-toggle').on('click keypress', function(e){
        if (e.type === 'keypress' && e.key !== 'Enter' && e.key !== ' ') return;
        var current = $(this).attr('aria-checked') === 'true';
        setBilling(current ? 'monthly' : 'annual');
      });

      // Plan selection
      $(document).on('click', '.select-plan', function(){
        var plan = $(this).data('plan');
        window.App.Storage.save('selected_plan', plan);
        $('#selected-plan').text(plan.charAt(0).toUpperCase() + plan.slice(1));
        alert('Plan selected: ' + plan);
      });

      // FAQ accordion
      $(document).on('click', '.faq-trigger', function(){
        var expanded = $(this).attr('aria-expanded') === 'true';
        var panel = $('#' + $(this).attr('aria-controls'));
        $(this).attr('aria-expanded', (!expanded).toString());
        if (!expanded){ panel.slideDown(220); panel.attr('aria-hidden','false'); }
        else { panel.slideUp(180); panel.attr('aria-hidden','true'); }
      });

      // Preview template (from hero cards)
      $(document).on('click', '.preview-template', function(){
        var id = $(this).data('template');
        var t = templates[id] || templates['hero-hero'];
        var content = `<h4 class=\"font-semibold\">${window.App.Helpers.escapeHtml(t.title)}</h4><pre class=\"mt-2 p-3 bg-gray-50 rounded\">${window.App.Helpers.escapeHtml(t.text)}</pre>`;
        showModal(content);
      });

      // Restore last demo output into modal when clicked if exists
      var last = window.App.Storage.load('last_demo', null);
      if (last && last.output){
        $(`[data-output-for=\"${last.demo}\"]`).html(`<div class=\"text-sm text-gray-800\">${window.App.Helpers.escapeHtml(last.output)}</div>`);
      }

      // Restore saved templates count and render grid
      renderTemplates('all');

      // small animate on hover for hero card group unless reduced motion requested
      if (!window.App.Helpers.prefersReducedMotion()){
        $('[data-animate]').on('mouseenter', function(){ $(this).css('transform','translateY(-12px) rotate(0deg) scale(1.02)'); });
        $('[data-animate]').on('mouseleave', function(){ $(this).css('transform',''); });
      }

    }catch(e){
      console.error('App.init error', e);
    }
  };

  // update prices on page according to billing cycle and persist selection
  function setBilling(mode){
    mode = mode === 'annual' ? 'annual' : 'monthly';
    $('#billing-toggle').attr('aria-checked', (mode === 'annual').toString());
    window.App.Storage.save('billing', mode);
    // update price displays
    $('[data-price-month]').each(function(){
      var $el = $(this);
      var m = $el.data('price-month');
      var a = $el.data('price-annual');
      if (mode === 'annual'){
        $el.text(window.App.Helpers.formatPrice(a, 'annual'));
      } else {
        $el.text(window.App.Helpers.formatPrice(m, 'monthly'));
      }
    });
  }

  window.App.render = function(){
    try{
      // reflect selected plan in UI if previously chosen
      var selected = window.App.Storage.load('selected_plan', null);
      if (selected){ $('#selected-plan').text(selected.charAt(0).toUpperCase() + selected.slice(1)); }
      // reflect billing saved
      var billing = window.App.Storage.load('billing', 'monthly');
      setBilling(billing);
    }catch(e){ console.error('App.render error', e); }
  };

})(window, jQuery);
