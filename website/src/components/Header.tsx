import React from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import Button from './Button';

import styles from './Header.module.scss';

const Header = (): React.ReactElement => {
  const context = useDocusaurusContext();
  const { siteConfig = { title: '', tagline: '' } } = context;

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <Head>
        <title>{siteConfig.title}</title>
        <meta property="og:image" content={'./img/og-image.png'} />
        <meta property="og:title" content={siteConfig.title} />
        <meta property="og:description" content={siteConfig.tagline} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>

      <div className={clsx(styles.heroBannerHolder)}>
        <div className={clsx(styles.heroBannerContainer, 'container')}>
          <div className="row">
            <div className="col col--8 col--offset-2">
              <img
                width="128"
                className={clsx(styles.heroBannerLogo, 'margin-vert--md')}
                src={'./img/lingui-logo.svg'}
                alt="Lingui"
              />
              <h1 className={clsx(styles.heroTitle)}>{siteConfig.tagline}</h1>
              <p className={'margin-bottom--lg'}>
                JavaScript library for internalization (i18n) of JavaScript projects, including React, Vue, Node.js, and
                Angular.
              </p>

              <div className={clsx(styles.heroButtons, 'name', 'margin-vert--md')}>
                <Button href={useBaseUrl('/tutorials/setup-react')}>Get Started</Button>
                <Button href={useBaseUrl('/introduction')} isOutline={true}>
                  Learn More
                </Button>
              </div>
              <iframe
                src={'https://ghbtns.com/github-btn.html?user=lingui&repo=js-lingui&type=star&count=true&size=large'}
                width="160px"
                height="30px"
                className={'margin-top--md'}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
