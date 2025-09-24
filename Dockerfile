ARG BASE_IMAGE=python:3.12-slim
FROM ${BASE_IMAGE}

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ARG PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
ENV PIP_INDEX_URL=${PIP_INDEX_URL}
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install minimal OS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (from pyproject constraints)
RUN pip install --no-cache-dir \
    mkdocs>=1.6.1 \
    mkdocs-material==9.6.17 \
    mkdocs-git-committers-plugin-2 \
    pymdown-extensions>=10.16.1 \
    python-frontmatter>=1.1.0 \
    pyyaml>=6.0.2 \
    rapidfuzz>=3.13.0 \
    ruamel-yaml>=0.18.15 \
    typer>=0.16.1 \
    gitpython>=3.1.45

# Copy project files
COPY . /app

EXPOSE 8000

# Default command: run mkdocs dev server
CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]
