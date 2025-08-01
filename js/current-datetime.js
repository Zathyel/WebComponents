class CurrentDateTime extends HTMLElement {
 constructor() {
  super();
  this.attachShadow({ mode: 'open' });
  this.intervalId = null;
 }

 static get observedAttributes() {
  return ['format', 'theme', 'show-seconds', 'timezone', 'locale', 'date-style', 'time-style'];
 }

 connectedCallback() {
  this.render();
  this.startUpdating();
 }

 disconnectedCallback() {
  if (this.intervalId) {
   clearInterval(this.intervalId);
  }
 }

 attributeChangedCallback() {
  if (this.shadowRoot) {
   this.render();
  }
 }

 startUpdating() {
  this.updateTime();
  this.intervalId = setInterval(() => {
   this.updateTime();
  }, 1000);
 }

 updateTime() {
  const timeElement = this.shadowRoot.querySelector('.time');
  const dateElement = this.shadowRoot.querySelector('.date');
  const labelElement = this.shadowRoot.querySelector('.label');

  if (timeElement && dateElement && labelElement) {
   const now = new Date();
   const locale = this.getAttribute('locale') || 'en-US';
   const format = this.getAttribute('format') || '12';
   const showSeconds = this.getAttribute('show-seconds') !== 'false';
   const timezone = this.getAttribute('timezone');
   const dateStyle = this.getAttribute('date-style') || 'full';
   const timeStyle = this.getAttribute('time-style') || 'medium';

   // Update label with localized text
   labelElement.textContent = this.getLocalizedLabel(locale);

   // Format time with locale support
   const timeOptions = this.getTimeOptions(format, showSeconds, timezone, timeStyle);

   // Format date with locale support  
   const dateOptions = this.getDateOptions(timezone, dateStyle);

   try {
    timeElement.textContent = now.toLocaleTimeString(locale, timeOptions);
    dateElement.textContent = now.toLocaleDateString(locale, dateOptions);
   } catch (error) {
    // Fallback to en-US if locale is invalid
    console.warn(`Invalid locale '${locale}', falling back to en-US`);
    timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
    dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
   }
  }
 }

 getLocalizedLabel(locale) {
  const labels = {
   'en': 'Current Time',
   'es': 'Hora Actual',
   'fr': 'Heure Actuelle',
   'de': 'Aktuelle Zeit',
   'it': 'Ora Corrente',
   'pt': 'Hora Atual',
   'ru': 'Текущее время',
   'ja': '現在時刻',
   'ko': '현재 시간',
   'zh': '当前时间',
   'ar': 'الوقت الحالي',
   'hi': 'वर्तमान समय',
   'nl': 'Huidige Tijd',
   'sv': 'Aktuell Tid',
   'da': 'Nuværende Tid',
   'no': 'Nåværende Tid',
   'fi': 'Nykyinen Aika',
   'pl': 'Aktualny Czas',
   'tr': 'Şu Anki Zaman',
   'th': 'เวลาปัจจุบัน'
  };

  // Extract language code from locale (e.g., 'en-US' -> 'en')
  const langCode = locale.split('-')[0].toLowerCase();
  return labels[langCode] || labels['en'];
 }

 getTimeOptions(format, showSeconds, timezone, timeStyle) {
  const options = {};

  // Set timezone if specified
  if (timezone) {
   options.timeZone = timezone;
  }

  // Handle predefined time styles
  if (['short', 'medium', 'long'].includes(timeStyle)) {
   options.timeStyle = timeStyle;
   // Note: when using timeStyle, hour12 might be ignored by some browsers
   // but we'll include it for better compatibility
   if (format === '12') {
    options.hour12 = true;
   } else if (format === '24') {
    options.hour12 = false;
   }
  } else {
   // Custom formatting
   options.hour = '2-digit';
   options.minute = '2-digit';
   options.hour12 = format === '12';

   if (showSeconds) {
    options.second = '2-digit';
   }
  }

  return options;
 }

 getDateOptions(timezone, dateStyle) {
  const options = {};

  // Set timezone if specified
  if (timezone) {
   options.timeZone = timezone;
  }

  // Handle predefined date styles
  if (['short', 'medium', 'long', 'full'].includes(dateStyle)) {
   options.dateStyle = dateStyle;
  } else {
   // Custom formatting (fallback)
   options.weekday = 'long';
   options.year = 'numeric';
   options.month = 'long';
   options.day = 'numeric';
  }

  return options;
 }

 getThemeStyles() {
  const theme = this.getAttribute('theme') || 'default';

  const themes = {
   default: `
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
   `,
   dark: `
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
   `,
   minimal: `
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.5);
    box-shadow: none;
   `
  };

  return themes[theme] || themes.default;
 }

 getTextDirection() {
  const locale = this.getAttribute('locale') || 'en-US';
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const langCode = locale.split('-')[0].toLowerCase();
  return rtlLocales.includes(langCode) ? 'rtl' : 'ltr';
 }

 render() {
  this.shadowRoot.innerHTML = `
   <style>
   :host {
    display: block;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
   }

   .datetime-container {
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    min-width: 280px;
    direction: ${this.getTextDirection()};
    ${this.getThemeStyles()}
   }

   .datetime-container:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
   }

   .time {
    font-size: 3rem;
    font-weight: 300;
    margin: 0;
    letter-spacing: 2px;
    font-variant-numeric: tabular-nums;
   }

   .date {
    font-size: 1.2rem;
    margin: 15px 0 0 0;
    opacity: 0.8;
    font-weight: 400;
   }

   .label {
    font-size: 0.9rem;
    opacity: 0.6;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
   }

   @media (max-width: 768px) {
    .datetime-container {
     min-width: 250px;
     padding: 20px;
    }
                            
    .time {
     font-size: 2.5rem;
    }
                            
    .date {
     font-size: 1rem;
    }
   }
  </style>
                    
  <div class="datetime-container">
   <div class="label">Current Time</div>
   <div class="time"></div>
   <div class="date"></div>
  </div>
  `;

  this.updateTime();
 }
}

// Register the custom element
customElements.define('current-datetime', CurrentDateTime);