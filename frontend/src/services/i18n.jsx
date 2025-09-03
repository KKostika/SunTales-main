import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          home: 'Home',
          about: 'About',
          teachers: 'Teachers',
          contact: 'Contact',
          login: 'Login',
          logout: 'Logout',
          language: 'Language',
          students: 'Students',
          parents: 'Parents',
          activities: 'Activities',
          users: 'Users',
          invoice: 'Invoices',
          classroom: 'Classroom',
          meals: 'Meals',
          menu: 'Menu',
          meetings: 'Meetings',
          medical_info: 'Medical Info',
          messages: 'Messages',
        },
      },
      el: {
        translation: {
          home: 'Αρχική',
          about: 'Σχετικά',
          teachers: 'Δάσκαλοι',
          contact: 'Επικοινωνία',
          login: 'Σύνδεση',
          logout: 'Αποσύνδεση',
          language: 'Γλώσσα',
          students: 'Μαθητές',
          parents: 'Γονείς',
          activities: 'Δραστηριότητες',
          users: 'Χρήστες',
          invoice: 'Τιμολόγια',
          classroom: 'Τάξη',
          meals: 'Γεύματα',
          menu: 'Μενού',
          meetings: 'Συναντήσεις',
          medical_info: 'Ιατρικές Πληροφορίες',
          messages: 'Μηνύματα',
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
