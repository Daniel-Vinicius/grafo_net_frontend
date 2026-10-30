const paths = {
  network: <><circle cx="6" cy="7" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><circle cx="6" cy="17" r="2.5" /><path d="M8.3 7.1l7.2-.8M7.8 9l7.4 7M8.5 16.9l6-.2M6 9.5v5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.8-5 3.3-7.5 7.5-7.5s6.7 2.5 7.5 7.5" /></>,
  users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.6-4.1 2.6-6.2 6-6.2s5.4 2.1 6 6.2M14.2 14.3c3.8-.8 6.1 1.1 6.8 4.8" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 10.5V17M12 7.2v.2" /></>,
}
export default function Icon({ name }: { name: keyof typeof paths }) {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}
