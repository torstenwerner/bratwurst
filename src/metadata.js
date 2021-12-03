import { writable } from "svelte/store";

export const locations = ['Bundesgebiet', 'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen',
'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];

export const currentLocation = writable(locations[0]);

export const ages = ['00+', '00-04', '05-14', '15-34', '35-59', '60-79', '80+'];

export const currentAge = writable(ages[0]);

export const postChanges = {
labels: ['07.11.2021', '08.11.2021', '09.11.2021', '10.11.2021', '11.11.2021', '12.11.2021', '13.11.2021', '14.11.2021',
    '15.11.2021', '16.11.2021', '17.11.2021', '18.11.2021', '19.11.2021', '20.11.2021'],
datasets: [{ values: [4.02, 4.22, 4.83, 5.39, 5.89, 6.23, 6.5, 6.61, 6.67, 6.87, 7.08, 7.21, 7.31, 7.41, 7.43] }]
};
