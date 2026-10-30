const paths = {
  network: <><circle cx="6" cy="7" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><circle cx="6" cy="17" r="2.5" /><path d="M8.3 7.1l7.2-.8M7.8 9l7.4 7M8.5 16.9l6-.2M6 9.5v5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.8-5 3.3-7.5 7.5-7.5s6.7 2.5 7.5 7.5" /></>,
  book: <path d="M12 6.5C10 5 7.5 4.5 4 4.5v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-14c-3.5 0-6 .5-8 2zM12 6.5v14" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  logout: <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 10.5V17M12 7.2v.2" /></>,
}
export default function Icon({ name }: { name: keyof typeof paths }) {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}
