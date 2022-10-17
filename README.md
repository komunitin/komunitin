# Komunitin

Open System for Exchange Communities

![build status](https://github.com/komunitin/komunitin/workflows/Build/badge.svg)

Komunitin features mutual credit currency management for communities. It is the natural successor of [IntegralCES](https://integralces.net) and it wants to be a
useful tool for local communities to build more resilient and sustainable economic structures.

## Demo
Check the installed version of the current `master` branch at [test.komunitin.org](https://test.komunitin.org). It uses dummy data from [demo.integralces.net](https://demo.integralces.net)

* user: noether@integralces.net
* password: integralces

## Structure
The Komunitin system is made of several units:
 - Komunitin app: The client application with user interface. See the [app](app/) folder.
 - Notifications service: The backend for the messaging system including push notifications. See the [notifications](notifications/) folder.
 - IntegralCES: The backend for the social and accounting APIs. These will be moved to two separate microservices but the APIs are provided by the classic 
 IntegralCES by now. See the [ices Drupal project](https://drupal.org/project/ices)
