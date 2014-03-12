#!/bin/bash

mongod --bind_ip=$IP --dbpath=$HOME/$C9_PID/data --nojournal --rest &