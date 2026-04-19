#!/bin/bash

 grep 'onCharacteristicUpdate.*value:' logs/blex_logs_2026-4-18-3.txt | 
 
 sed -e 's/.*characteristic:[\ ]*\([^ ]*\).*value:[\ ]*\([^\ ]*\)/\1, \2/'