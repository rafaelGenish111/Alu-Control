import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState('auto');
  const [isDark, setIsDark] = useState(false);

  // טעינת מצב מ-localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode('dark');
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (savedMode === 'false') {
      setDarkMode('light');
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode('auto');
      // Auto mode - based on time
      const hour = new Date().getHours();
      const shouldBeDark = hour >= 18 || hour < 6;
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // עדכון מצב תצוגה
  const changeDarkMode = (mode) => {
    console.log('🔄 Changing dark mode to:', mode);
    console.log('📋 Before - HTML classes:', document.documentElement.className);

    // עדכן רק את ה-state - ה-useEffect יעדכן את ה-DOM
    setDarkMode(mode);

    // עדכן את localStorage
    if (mode === 'dark') {
      localStorage.setItem('darkMode', 'true');
    } else if (mode === 'light') {
      localStorage.setItem('darkMode', 'false');
    } else {
      localStorage.removeItem('darkMode');
    }
  };

  // עדכון אוטומטי של ה-DOM בהתאם למצב
  useEffect(() => {
    console.log('🔄 useEffect triggered, darkMode:', darkMode);
    console.log('📋 Current HTML classes before update:', document.documentElement.className);

    // MutationObserver כדי לזהות אם משהו אחר משנה את ה-class
    let isUpdating = false;
    const observer = new MutationObserver((mutations) => {
      if (isUpdating) return; // התעלם משינויים שאנחנו עושים בעצמנו

      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasDark = document.documentElement.classList.contains('dark');
          const expectedDark = darkMode === 'dark' || (darkMode === 'auto' && (new Date().getHours() >= 18 || new Date().getHours() < 6));

          if (hasDark !== expectedDark && darkMode !== 'auto') {
            console.warn(`⚠️ Dark class was changed externally! Expected: ${expectedDark}, Actual: ${hasDark}`);
            isUpdating = true;
            if (darkMode === 'dark' && !hasDark) {
              console.log('🔧 Fixing: Adding dark class back');
              document.documentElement.classList.add('dark');
            } else if (darkMode === 'light' && hasDark) {
              console.log('🔧 Fixing: Removing dark class');
              document.documentElement.classList.remove('dark');
            }
            setTimeout(() => { isUpdating = false; }, 50);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    if (darkMode === 'auto') {
      const checkDarkMode = () => {
        const hour = new Date().getHours();
        const shouldBeDark = hour >= 18 || hour < 6;

        // בדוק אם המצב כבר נכון כדי למנוע עדכונים מיותרים
        const currentIsDark = document.documentElement.classList.contains('dark');
        if (currentIsDark === shouldBeDark) {
          return; // אין צורך לעדכן
        }

        setIsDark(shouldBeDark);

        // הסר את ה-class קודם, ואז הוסף אם צריך
        document.documentElement.classList.remove('dark');
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        }
      };

      checkDarkMode();
      const interval = setInterval(checkDarkMode, 60000); // Check every minute
      return () => clearInterval(interval);
    } else if (darkMode === 'light') {
      // אם במצב light, ודא שה-class הוסר
      console.log('✅ Ensuring light mode - removing dark class');
      document.documentElement.classList.remove('dark');
      setIsDark(false);
      console.log('📋 HTML classes after update:', document.documentElement.className);

      // בדיקה נוספת אחרי 100ms
      setTimeout(() => {
        if (document.documentElement.classList.contains('dark')) {
          console.warn('⚠️ Dark class still exists after 100ms! Force removing...');
          document.documentElement.classList.remove('dark');
        }
        console.log('📋 Final check - HTML classes:', document.documentElement.className);
      }, 100);
    } else if (darkMode === 'dark') {
      // אם במצב dark, ודא שה-class קיים
      console.log('✅ Ensuring dark mode - adding dark class');
      document.documentElement.classList.remove('dark'); // הסר קודם למקרה שיש
      document.documentElement.classList.add('dark');
      setIsDark(true);
      console.log('📋 HTML classes after update:', document.documentElement.className);

      // בדיקה נוספת אחרי 100ms
      setTimeout(() => {
        if (!document.documentElement.classList.contains('dark')) {
          console.warn('⚠️ Dark class missing after 100ms! Force adding...');
          document.documentElement.classList.add('dark');
        }
        console.log('📋 Final check - HTML classes:', document.documentElement.className);
      }, 100);
    }

    return () => {
      observer.disconnect();
    };
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, isDark, changeDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
