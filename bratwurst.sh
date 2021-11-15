#!/bin/bash

set -e

CSV="https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_COVID-19-Hospitalisierungen.csv"

curl -s $CSV | awk -F, '$2 == "Sachsen" && $4 == "60-79" {print $1, $6}' | \
    jq -R '[inputs | split(" ") | { date: .[0], incidence: .[1] }]' > bratwurst.json
