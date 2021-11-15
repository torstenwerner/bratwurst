#!/bin/bash

set -e

CSV="https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_COVID-19-Hospitalisierungen.csv"

curl -s $CSV > raw.csv

for LOCATION in 'Baden-Württemberg' 'Bayern' 'Berlin' 'Brandenburg' 'Bremen' 'Bundesgebiet' 'Hamburg' 'Hessen' \
    'Mecklenburg-Vorpommern' 'Niedersachsen' 'Nordrhein-Westfalen' 'Rheinland-Pfalz' 'Saarland' 'Sachsen' \
    'Sachsen-Anhalt' 'Schleswig-Holstein' 'Thüringen'
do
    awk -F, '$2 == "'$LOCATION'" && $4 == "60-79" {print $1, $6}' < raw.csv | \
        jq -R '[inputs | split(" ") | { date: .[0], incidence: .[1] }]' > public/data/$LOCATION.json
done

rm -f raw.csv
