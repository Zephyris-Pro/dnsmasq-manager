import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { fetchVersion } from '../lib/api';

export function SiteFooter() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    fetchVersion()
      .then((s) => setVersion(s.version ?? ''))
      .catch(() => {});
  }, []);

  return (
    <footer className="footer footer-transparent d-print-none py-3">
      <div className="container-xl">
        <div className="row text-center align-items-center flex-row-reverse">
          <div className="col-lg-auto ms-lg-auto">
            <ul className="list-inline list-inline-dots mb-0">
              <li className="list-inline-item">
                <a
                  href="https://github.com/Zephyris-Pro/dnsmasq-manager"
                  target="_blank"
                  className="link-secondary"
                  rel="noopener noreferrer"
                >
                  <FormattedMessage id="footer.github" />
                </a>
              </li>
            </ul>
          </div>
          <div className="col-12 col-lg-auto mt-3 mt-lg-0">
            <ul className="list-inline list-inline-dots mb-0">
              <li className="list-inline-item">
                <FormattedMessage id="footer.copyright" values={{ year: new Date().getFullYear() }} />{' '}
                <a
                  href="https://github.com/Zephyris-Pro"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="link-secondary"
                >
                  Zephyris-Pro
                </a>
              </li>
              <li className="list-inline-item">
                <FormattedMessage id="footer.theme" />{' '}
                <a
                  href="https://tabler.io"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="link-secondary"
                >
                  Tabler
                </a>
              </li>
              {version && (
                <li className="list-inline-item">
                  <a
                    href={`https://github.com/Zephyris-Pro/dnsmasq-manager/releases/tag/v${version}`}
                    className="link-secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage id="footer.version" values={{ version }} />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
