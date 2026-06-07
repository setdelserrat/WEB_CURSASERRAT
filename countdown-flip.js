// Initialize flip countdown functionality using GSAP TweenMax
var FlipCountdown = {
  // Setup the element references
  $el: null,
  
  // Params
  countdown_interval: null,
  total_seconds     : 0,
  
  // Initialize the countdown  
  init: function(selector, targetDateString) {
    this.$el = $(selector);
    if (!this.$el.length) return;

    // DOM References
    this.$ = {
      days   : this.$el.find('.bloc-time.days .figure'),
      hours  : this.$el.find('.bloc-time.hours .figure'),
      minutes: this.$el.find('.bloc-time.min .figure'),
      seconds: this.$el.find('.bloc-time.sec .figure')
    };

    // Calculate initial difference between target date and now
    var targetDate = new Date(targetDateString).getTime();
    var now = new Date().getTime();
    this.total_seconds = Math.max(0, Math.floor((targetDate - now) / 1000));

    // Calculate Days, Hours, Mins, Secs
    var days = Math.floor(this.total_seconds / (3600 * 24));
    var hours = Math.floor((this.total_seconds % (3600 * 24)) / 3600);
    var minutes = Math.floor((this.total_seconds % 3600) / 60);
    var seconds = Math.floor(this.total_seconds % 60);

    // Set initial values in our JS object
    this.values = {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };

    // Initialize the text values in the DOM
    this.initDOM(this.$.days, days);
    this.initDOM(this.$.hours, hours);
    this.initDOM(this.$.minutes, minutes);
    this.initDOM(this.$.seconds, seconds);

    // Start timer
    if (this.total_seconds > 0) {
      this.count();
    }
  },

  initDOM: function($figures, value) {
    if (!$figures || !$figures.length) return;
    
    var numDigits = $figures.length;
    var valStr = value.toString().padStart(numDigits, '0');

    for (var i = 0; i < numDigits; i++) {
      var val = valStr.charAt(i);
      var $fig = $figures.eq(i);
      if ($fig.length) {
        $fig.find('.top').html(val);
        $fig.find('.bottom').html(val);
        $fig.find('.bottom-back span').html(val);
      }
    }
  },
  
  count: function() {
    var that    = this;
    
    this.countdown_interval = setInterval(function() {
      if(that.total_seconds > 0) {

        --that.values.seconds;              

        if(that.values.minutes >= 0 && that.values.seconds < 0) {
            that.values.seconds = 59;
            --that.values.minutes;
        }

        if(that.values.hours >= 0 && that.values.minutes < 0) {
            that.values.minutes = 59;
            --that.values.hours;
        }

        if(that.values.days >= 0 && that.values.hours < 0) {
            that.values.hours = 23;
            --that.values.days;
        }

        // Update DOM values
        if (that.$.days) that.checkDigitUpdate(that.values.days, that.$.days);
        if (that.$.hours) that.checkDigitUpdate(that.values.hours, that.$.hours);
        if (that.$.minutes) that.checkDigitUpdate(that.values.minutes, that.$.minutes);
        if (that.$.seconds) that.checkDigitUpdate(that.values.seconds, that.$.seconds);

        --that.total_seconds;
      }
      else {
        clearInterval(that.countdown_interval);
      }
    }, 1000);    
  },
  
  animateFigure: function($el, value) {
    if (!$el || !$el.length) return;
    
    var $top         = $el.find('.top'),
        $bottom      = $el.find('.bottom'),
        $back_top    = $el.find('.top-back'),
        $back_bottom = $el.find('.bottom-back');

    // Before we begin, change the back value
    $back_top.find('span').html(value);
    $back_bottom.find('span').html(value);

    // Then animate
    TweenMax.to($top, 0.8, {
        rotationX           : '-180deg',
        transformPerspective: 300,
        ease                : Quart.easeOut,
        onComplete          : function() {
            $top.html(value);
            $bottom.html(value);
            TweenMax.set($top, { rotationX: 0 });
        }
    });

    TweenMax.to($back_top, 0.8, { 
        rotationX           : 0,
        transformPerspective: 300,
        ease                : Quart.easeOut, 
        clearProps          : 'all' 
    });    
  },
  
  checkDigitUpdate: function(value, $figures) {
    if (!$figures || !$figures.length) return;
    var numDigits = $figures.length;
    var valStr = value.toString().padStart(numDigits, '0');
    
    for (var i = 0; i < numDigits; i++) {
      var val = valStr.charAt(i);
      var $fig = $figures.eq(i);
      if ($fig.length) {
        var fig_val = $fig.find('.top').html();
        if (fig_val !== val) {
          this.animateFigure($fig, val);
        }
      }
    }
  }
};

// Start it when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // We get the date from configuracioWeb which is defined in script.js
    if (typeof configuracioWeb !== 'undefined' && configuracioWeb.dataEsdeveniment) {
        // Assume jQuery is loaded via CDN in index.html for this to work
        if (typeof jQuery !== 'undefined' && typeof TweenMax !== 'undefined') {
            FlipCountdown.init('.countdown', configuracioWeb.dataEsdeveniment);
        } else {
            console.error('jQuery o TweenMax (GSAP) no estan disponibles.');
        }
    }
});
