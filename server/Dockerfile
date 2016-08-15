FROM mhart/alpine-node:6

WORKDIR /src
ADD . /src
RUN npm install

EXPOSE 3434
CMD ["npm", "start"]
