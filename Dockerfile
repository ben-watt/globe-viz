FROM node:lts-alpine3.13 AS npm-install-ui

WORKDIR /ui-app
COPY /UI/package.json /UI/package-lock.json  ./
RUN npm install

FROM npm-install-ui AS build-ui

COPY /UI  .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS build

WORKDIR /app
COPY /API/*.csproj .
RUN dotnet restore -r linux-musl-x64

COPY /API/ .
RUN dotnet publish ./globe-viz.csproj -c release -o /app/release -r linux-musl-x64 --self-contained false --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:5.0-alpine-amd64 AS release

WORKDIR /
COPY --from=build /app/release ./api
COPY --from=build-ui /ui-app/build ./ui

# See: https://github.com/dotnet/announcements/issues/20
# Uncomment to enable globalization APIs (or delete)
#ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
#RUN apk add --no-cache icu-libs
#ENV LC_ALL=en_US.UTF-8
#ENV LANG=en_US.UTF-8
WORKDIR /api
ENTRYPOINT ["dotnet", "globe-viz.dll"]