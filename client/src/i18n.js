import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // --- General / Layout ---
      "active_orders": "Active Orders",
      "new_order": "+ New Order",
      "create_order": "Create Order",
      "cancel": "Cancel",
      "save": "Save",
      "search": "Search",
      "dashboard": "Dashboard",
      "login": "Login",
      "logout": "Logout",
      "welcome": "Welcome",
      "back_to_list": "Back to List",
      "delete": "Delete",
      
      // --- Order Details ---
      "order_number": "Order No.",
      "manual_order_number": "Manual Order #",
      "client_name": "Client Name",
      "address": "Address",
      "region": "Region",
      "phone": "Phone",
      "email": "Email",
      "items_count": "Items",
      "status": "Status",
      "deposit_amount": "Deposit",
      "deposit_date": "Deposit Date",
      "est_work_days": "Est. Work Days",
      "order_date": "Order Date",
      "workflow": "Workflow",
      
      // --- Statuses ---
      "status_scheduled": "Scheduled",
      "status_pending_approval": "Pending Approval",
      "status_material_pending": "Material Pending",
      "status_production": "Production",
      "status_in_production": "In Production",
      "ready_for_install": "Ready for Installation",
      
      // --- Master Plan ---
      "master_plan": "Master Plan",
      "upload_master_plan": "Upload Master Plan",
      "no_master_plan": "No master plan uploaded",
      "view_master_plan": "View Master Plan",
      
      // --- Files & Media ---
      "files_media": "Files and Media",
      "upload_doc": "Upload Document / Photo",
      
      // --- Products Table (Client) ---
      "products_for_client": "Products for Client",
      "type": "Type",
      "description": "Description",
      "dimensions": "Dimensions",
      "quantity": "Qty",
      
      // --- Materials Table (Factory) ---
      "materials_to_order": "Materials to Order",
      "glass": "Glass",
      "paint": "Paint",
      "other": "Other",
      "select_supplier": "Select Supplier",
      "supplier": "Supplier",
      
      // --- Purchasing & Procurement ---
      "purchasing_center": "Purchasing Center",
      "pending_items_page": "Pending Items", 
      "pending_item_to_order": "Pending Item to Order",
      "material_type": "Type",
      "ordered": "Ordered",
      "purchasing_tracking": "Purchasing & Receiving",
      "view_suppliers": "View Suppliers",
      "supplier_management": "Supplier Management",
      "add_supplier": "Add Supplier",
      "contact_person": "Contact Person",

      // --- Production ---
      "view_production": "View Production",
      "production_floor": "Production Floor",
      "mark_ready": "Mark as Ready",
      
      // --- Installation / Calendar ---
      "calendar": "Calendar",
      "installations_center": "Installations Center",
      "view_installations": "View Installations",
      "schedule_job": "Schedule Job",
      "start_date": "Start Date",
      "end_date": "End Date",
      "assign_team": "Assign Team",
      "install_notes": "Installation Notes",
      "save_schedule": "Save Schedule",
      "installer_app": "Installer App",
      "my_tasks": "My Tasks Today",
      "finish_job": "Finish Job",
      "upload_proof": "Photo Proof",
      
      // --- Admin ---
      "admin_panel": "User Management",
      "create_user": "Create New User",
      "role": "Role",
      "name": "Name",
      "password": "Password",
      
      // --- Messages ---
      "success": "Action Successful",
      "error": "Error occurred",
      "uploading": "Uploading...",

      // --- Calendar Days & Months ---
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday",
      "sunday": "Sunday",
      
      "january": "January",
      "february": "February",
      "march": "March",
      "april": "April",
      "may": "May",
      "june": "June",
      "july": "July",
      "august": "August",
      "september": "September",
      "october": "October",
      "november": "November",
      "december": "December"
    }
  },
  es: {
    translation: {
      // --- General / Layout ---
      "active_orders": "Trabajos en curso", //
      "new_order": "+ Añadir nuevo",
      "create_order": "Crear",
      "cancel": "Cancelar",
      "save": "Guardar",
      "search": "Buscar",
      "dashboard": "Tablero",
      "login": "Iniciar sesión",
      "logout": "Cerrar sesión",
      "welcome": "Bienvenido",
      "back_to_list": "Volver a la lista",
      "delete": "Eliminar",
      
      // --- Order Details ---
      "order_number": "No. presupuesto",
      "manual_order_number": "Nº de presupuesto", //
      "client_name": "Cliente",
      "address": "Dirección",
      "region": "Localidad", //
      "phone": "Nº de Teléfono",
      "email": "Email",
      "items_count": "Nº artículos",
      "status": "Estado",
      "deposit_amount": "Depósito",
      "deposit_date": "Fecha pago deposito", //
      "est_work_days": "Días instalación", //
      "order_date": "Fecha presupuesto", //
      "workflow": "Flujo de trabajo",
      
      // --- Statuses ---
      "status_scheduled": "Pendiente instalación", //
      "status_pending_approval": "Pendiente contabilizar", //
      "status_material_pending": "Pendiente compra", //
      "status_production": "Pendiente fabricación", //
      "status_in_production": "En Producción",
      "ready_for_install": "Listo para instalar",
      
      // --- Master Plan ---
      "master_plan": "Parte trabajo", //
      "upload_master_plan": "Descargar parte de trabajo", //
      "no_master_plan": "Parte de trabajo pendiente de subir", //
      "view_master_plan": "Ver parte de trabajo",
      
      // --- Files & Media ---
      "files_media": "Archivos y medios",
      "upload_doc": "Subir documento / foto",
      
      // --- Products Table (Client) ---
      "products_for_client": "Productos a instalar", //
      "type": "Tipo", //
      "description": "Descripción",
      "dimensions": "Dimensiones",
      "quantity": "Cant.",
      
      // --- Materials Table (Factory) ---
      "materials_to_order": "Material a pedir", //
      "glass": "Cristales", //
      "paint": "Lacado", //
      "other": "Otro", //
      "select_supplier": "Proveedor", //
      "supplier": "Proveedor",
      
      // --- Purchasing & Procurement ---
      "purchasing_center": "Centro de compras",
      "pending_items_page": "Compras", //
      "pending_item_to_order": "Artículos pendientes de pedir", //
      "material_type": "Material", //
      "ordered": "Pedido",
      "purchasing_tracking": "Compras y Recepción",
      "view_suppliers": "Ver Proveedores",
      "supplier_management": "Gestión de proveedores",
      "add_supplier": "Añadir proveedor",
      "contact_person": "Persona de contacto",

      // --- Production ---
      "view_production": "Ver Producción",
      "production_floor": "Piso de producción",
      "mark_ready": "Marcar como listo",

      // --- Installation / Calendar ---
      "calendar": "Calendario",
      "installations_center": "Centro de instalaciones",
      "view_installations": "Ver Instalaciones",
      "schedule_job": "Agendar trabajo",
      "start_date": "Fecha de inicio",
      "end_date": "Fecha de finalización",
      "assign_team": "Asignar equipo",
      "install_notes": "Notas de instalación",
      "save_schedule": "Guardar horario",
      "installer_app": "App de instaladores",
      "my_tasks": "Mis tareas de hoy",
      "finish_job": "Finalizar trabajo",
      "upload_proof": "Foto de prueba",
      
      // --- Admin ---
      "admin_panel": "Gestión de usuarios",
      "create_user": "Crear nuevo usuario",
      "role": "Rol",
      "name": "Nombre",
      "password": "Contraseña",
      
      // --- Messages ---
      "success": "Acción exitosa",
      "error": "Ocurrió un error",
      "uploading": "Subiendo...",

      // --- Calendar Days & Months (Added from new image) ---
      "monday": "Lunes", //
      "tuesday": "Martes", //
      "wednesday": "Miércoles", //
      "thursday": "Jueves", //
      "friday": "Viernes", //
      "saturday": "Sábado", //
      "sunday": "Domingo", //
      
      "january": "Enero", //
      "february": "Febrero", //
      "march": "Marzo", //
      "april": "Abril", //
      "may": "Mayo", //
      "june": "Junio", //
      "july": "Julio", //
      "august": "Agosto", //
      "september": "Septiembre", //
      "october": "Octubre", //
      "november": "Noviembre", //
      "december": "Diciembre" //
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;