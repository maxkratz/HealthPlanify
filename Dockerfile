FROM node:20-bullseye
ENV DEBIAN_FRONTEND=noninteractive

# Update and install required packages
RUN apt-get update -q
RUN apt-get upgrade -yq
RUN apt-get install -yq \
        build-essential lsb-release locales \
        bash-completion git tmux xdg-utils

RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Remove apt lists (for storage efficiency)
RUN rm -rf /var/lib/apt/lists/*

CMD ["bash"]
