import os
import csv
import json

def intTryParse(value):
    try:
        return int(value), True
    except ValueError:
        return value, False

entries = []

with open('pieces_new.csv', 'rb') as csvfile:
    piecereader = csv.reader(csvfile, delimiter=',', quotechar='|')
    for row in piecereader:
        idnumber = row[-1]
        color = row[-2]
        if not intTryParse(idnumber)[1]:
            print 'Bad or empty ID'
            continue
        thisone = {
            'artid': idnumber.strip(),
            'color':  color.strip()
        }
        entries.append(thisone)
        #print row


with open('jsonpieces_new.txt', 'w') as outfile:  
    print len(entries)
    json.dump(entries, outfile)
