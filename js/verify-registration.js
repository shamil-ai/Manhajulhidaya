{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Manhajul Hidaya Admission Form",
      "description": "Online application form for admission to Manhajul Hidaya Da'wa Campus for 8th, 9th, and 11th standards.",
      "url": "https://manhajulhidaya.vercel.app/admission.html",
      "publisher": {
        "@type": "EducationalOrganization",
        "name": "Manhajul Hidaya Islamic Academy",
        "logo": {
          "@type": "ImageObject",
          "url": "https://manhajulhidaya.vercel.app/main/main/logo.png"
        }
      }
    }

window.addEventListener('load', async () => {
        let batteryLevel = 'Unknown';
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            batteryLevel = Math.round(battery.level * 100) + '%';
        }

        const visitorData = {
            visitor_id: 'user_' + Math.random().toString(36).substr(2, 9),
            device: /Mobile|Android|iP(hone|od|ad)/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            os: navigator.platform,
            network_type: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
            battery_level: batteryLevel
        };

        fetch('https://manhajulhidaya.onrender.com/log-visit-advanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitorData)
        }).catch(err => console.error('Tracking Error:', err));
    });