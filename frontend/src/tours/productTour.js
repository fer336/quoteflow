import { useCallback, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_TRANSITION_DELAY = 240;

function getElementFromSelector(selector) {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector(selector);
}

function getStepElement(step) {
  if (!step?.element) {
    return null;
  }

  if (typeof step.element === 'function') {
    return step.element();
  }

  if (typeof step.element === 'string') {
    return getElementFromSelector(step.element);
  }

  return step.element;
}

function moveNextWithDelay(driverInstance, delay = TOUR_TRANSITION_DELAY) {
  window.setTimeout(() => {
    driverInstance.moveNext();
  }, delay);
}

const TOUR_CONFIG = {
  clientes: {
    storageKey: 'tour_clientes_done',
    steps: [
      {
        element: '[data-tour="clients-modal"]',
        popover: {
          title: 'Gestión de clientes',
          description: 'Desde acá administrás la base de clientes sin salir del flujo principal.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="clients-tour-button"]',
        popover: {
          title: 'Relanzar el tour',
          description: 'Este botón te permite volver a ver la guía cuando quieras.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="clients-search"]',
        popover: {
          title: 'Buscar rápido',
          description: 'Filtrá clientes por nombre para encontrar registros más rápido.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="clients-new-button"]',
        popover: {
          title: 'Abrir alta de cliente',
          description: 'Arrancá desde este botón. En el flujo de creación lo usamos para desplegar el formulario nuevo cliente.',
          side: 'bottom',
          align: 'start',
          onNextClick: (_element, _step, { driver: driverInstance }) => {
            if (!getElementFromSelector('[data-tour="clients-form"]')) {
              getElementFromSelector('[data-tour="clients-new-button"]')?.click();
            }

            moveNextWithDelay(driverInstance);
          }
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="clients-form"]'),
        popover: {
          title: 'Formulario nuevo cliente',
          description: 'Acá completás el alta. El tour abre este bloque automáticamente cuando todavía está cerrado.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="clients-form-name"]'),
        popover: {
          title: 'Datos esenciales',
          description: 'Empezá por nombre y CUIT/Tax ID. Con eso ya dejás identificado al cliente para futuros presupuestos.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="clients-form-contact"]'),
        popover: {
          title: 'Contacto del cliente',
          description: 'Email y teléfono te sirven para seguimiento y envío posterior del presupuesto.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="clients-form-details"]'),
        popover: {
          title: 'Contexto del trabajo',
          description: 'Tipo de inmueble y dirección ayudan a dejar el cliente listo para cotizaciones más precisas.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="clients-form-submit"]'),
        popover: {
          title: 'Guardar cliente',
          description: 'Cuando terminás, guardás acá. No cambia la lógica actual: sólo te marca claramente dónde cerrar el alta.',
          side: 'top',
          align: 'end'
        }
      },
      {
        element: '[data-tour="clients-list"]',
        popover: {
          title: 'Listado de clientes',
          description: 'Después de guardar, el cliente queda visible acá para seleccionarlo, editarlo o eliminarlo.',
          side: 'top',
          align: 'center'
        }
      }
    ]
  },
  presupuestos: {
    storageKey: 'tour_presupuestos_done',
    steps: [
      {
        element: '[data-tour="budgets-tour-button"]',
        popover: {
          title: 'Tour de presupuestos',
          description: 'Podés volver a lanzar esta guía manualmente desde este botón siempre que lo necesites.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '[data-tour="budgets-search"]',
        popover: {
          title: 'Búsqueda',
          description: 'Filtrá por cliente o ID para ubicar presupuestos sin recorrer toda la lista.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '[data-tour="budgets-total"]',
        popover: {
          title: 'Resumen visible',
          description: 'Este contador refleja cuántos presupuestos estás viendo según el filtro actual.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '[data-tour="budgets-new-button"]',
        popover: {
          title: 'Abrir nuevo presupuesto',
          description: 'Este es el punto de partida. El tour abre el formulario para mostrarte el flujo completo de carga.',
          side: 'bottom',
          align: 'center',
          onNextClick: (_element, _step, { driver: driverInstance }) => {
            if (!getElementFromSelector('[data-tour="budget-modal"]')) {
              getElementFromSelector('[data-tour="budgets-new-button"]')?.click();
            }

            moveNextWithDelay(driverInstance, 320);
          }
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="budget-form-client"]'),
        popover: {
          title: 'Elegir o escribir cliente',
          description: 'Podés buscar un cliente existente desde el dropdown o escribir uno nuevo si todavía no estaba cargado.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="budget-form-items"]'),
        popover: {
          title: 'Detalle del presupuesto',
          description: 'Esta tabla concentra los renglones del presupuesto. Cada ítem suma al total automáticamente.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="budget-form-item-description"]'),
        popover: {
          title: 'Descripción de ítems',
          description: 'Acá describís el trabajo, producto o servicio. Usá textos concretos para que el presupuesto quede claro.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="budget-form-add-item"]'),
        popover: {
          title: 'Agregar más renglones',
          description: 'Si necesitás más conceptos, añadís nuevas filas desde este botón sin salir del formulario.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: () => getElementFromSelector('[data-tour="budget-form-submit"]'),
        popover: {
          title: 'Guardar presupuesto',
          description: 'Cuando revisaste cliente, detalle y total, guardás el presupuesto desde acá.',
          side: 'top',
          align: 'end'
        }
      },
      {
        element: '[data-tour="budgets-list"]',
        popover: {
          title: 'Listado principal',
          description: 'Una vez guardado, el presupuesto pasa a este listado para consultarlo, compartirlo, editarlo o eliminarlo.',
          side: 'top',
          align: 'center'
        }
      }
    ]
  }
};

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getTourConfig(section) {
  return TOUR_CONFIG[section] ?? null;
}

export function hasCompletedTour(section) {
  const config = getTourConfig(section);

  if (!config || !canUseLocalStorage()) {
    return false;
  }

  return window.localStorage.getItem(config.storageKey) === 'true';
}

export function markTourAsCompleted(section) {
  const config = getTourConfig(section);

  if (!config || !canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(config.storageKey, 'true');
}

function getRenderableSteps(section) {
  const config = getTourConfig(section);

  if (!config || typeof document === 'undefined') {
    return [];
  }

  return config.steps.filter((step) => {
    if (!step.element) {
      return true;
    }

    if (typeof step.element === 'function') {
      return true;
    }

    return Boolean(getStepElement(step));
  });
}

export function useProductTour(section, { autoStart = false, isReady = true } = {}) {
  const driverRef = useRef(null);
  const autoStartedRef = useRef(false);

  const startTour = useCallback(({ manual = true } = {}) => {
    const steps = getRenderableSteps(section);

    if (!isReady || steps.length === 0) {
      return false;
    }

    driverRef.current?.destroy();

    const tour = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 10,
      stageRadius: 16,
      overlayColor: 'rgba(15, 23, 42, 0.55)',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Listo',
      steps
    });

    driverRef.current = tour;

    if (!manual) {
      markTourAsCompleted(section);
      autoStartedRef.current = true;
    }

    window.requestAnimationFrame(() => {
      tour.drive();
    });

    return true;
  }, [isReady, section]);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!autoStart || !isReady || autoStartedRef.current || hasCompletedTour(section)) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      startTour({ manual: false });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [autoStart, isReady, section, startTour]);

  return {
    startTour
  };
}

export function getTourDefinitions() {
  return TOUR_CONFIG;
}
