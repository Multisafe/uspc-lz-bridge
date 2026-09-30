FROM stellar/stellar-cli@sha256:f2026aa61b3d7896444c642c5f29489b7620afaffbb3e17653e2634306a20c4b

# stellar-cli 25.1.0 / Rust 1.90.0, run on linux/amd64.
# Sources are mounted read-only; downloads and build outputs stay outside the image.
ENV CARGO_HOME=/output/cargo \
    CARGO_BUILD_JOBS=2 \
    TMPDIR=/output/tmp \
    STELLAR_CONFIG_HOME=/output/config \
    STELLAR_DATA_HOME=/output/data

WORKDIR /source
ENTRYPOINT ["sh", "/source/reproduce.sh"]
