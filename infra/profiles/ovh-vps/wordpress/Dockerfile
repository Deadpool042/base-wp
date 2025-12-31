# Option A (patch auto) :
ARG WP_IMAGE_TAG=6.9-php8.3-fpm
FROM wordpress:${WP_IMAGE_TAG}

# Option B (pinné) :
# FROM wordpress:6.9.0-php8.3-fpm

RUN apt-get update -qq \
  && apt-get install -y -qq --no-install-recommends \
    curl \
    ca-certificates \
    procps \
  && rm -rf /var/lib/apt/lists/*

COPY php.ini /usr/local/etc/php/conf.d/zz-base-wp.ini

COPY entrypoint.sh /usr/local/bin/base-wp-entrypoint.sh
RUN chmod +x /usr/local/bin/base-wp-entrypoint.sh

ENTRYPOINT ["base-wp-entrypoint.sh"]
CMD ["php-fpm"]