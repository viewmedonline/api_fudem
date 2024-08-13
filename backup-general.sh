#!/bin/bash
# Title       : viewmed_backup.sh
# Date        : 2021-02-19
# Author      : "Freddy Banquez" <fbanquez@gmail.com>
# Version     : 1.0
# Description : Script used to backup data from MongoDB
# Options     : None
################################################################################
##
# Block with the variables to be used in the script
##
#
# YOU CAN ONLY MODIFY THIS SCRIPT BLOCK
#
# FOLDER=`date +"%Y%m%d"`
# HOST="localhost"
# PORT="27017"
# USER_ADM="admin"
# PASSWD_ADM="AAAAC3NzaC1lZDI1NTE5AAAAIJTe9iUMyPggPIP2"
# USER_AUTH="viewmed"
# PASSWD_AUTH="qwerty"
# DATABASE="viewmedFudem"
# DATABASE_AUTH="admin"
# PATH_BACKUP="./backups/$FOLDER"
# LOGFILE="./backups/database_backup.log"
# FILE_NAME="viewmedFudem.gz"
# isBckDone=false

FOLDER=$(date +"%Y%m%d")
HOST="localhost"
PORT="27017"
USER_ADM="root"
PASSWD_ADM="123456"
USER_AUTH="root"
PASSWD_AUTH="123456"
DATABASE="fudem"
DATABASE_AUTH="admin"
PATH_BACKUP="./backups/$FOLDER"
LOGFILE="./backups/database_backup.log"
FILE_NAME="viewmedFudem.gz"
isBckDone=false
#
################################################################################
#
#
# DO NOT MODIFY THE SCRIPT FROM HERE
#
###########################
#
# Function that writes to the log file
#
###########################
function log() {
  datestring=$(date +'%Y-%m-%d %H:%M:%S')
  echo -e "$datestring - $@" >>$LOGFILE
}

###########################
#
#      Main Block
#
###########################
bk_general() {
  #
  # Making Folder
  log "Creating backup folder"
  mkdir $PATH_BACKUP >/dev/null 2>&1
  if [ $? -eq 0 ]; then

    # Instructions that manage the database backup
    log "Locking database"
    msg=$(mongo $DATABASE --host $HOST --port $PORT --username $USER_ADM --password $PASSWD_ADM --authenticationDatabase $DATABASE_AUTH --eval 'db.fsyncLock()')
    if [[ $msg == *"now locked against writes"* && $msg == *": 1"* ]]; then

      log "Making database backup"
      isBckDone=true
      msg=$(mongodump --uri="mongodb://$USER_AUTH:$PASSWD_AUTH@$HOST:$PORT/$DATABASE?authSource=$DATABASE_AUTH" --excludeCollection fs.chunks --gzip --quiet --archive="$PATH_BACKUP/$FILE_NAME")
      if [ $? -eq 0 ]; then
        log "Database backup done"
      else # Backup problems
        log "Database backup failed"
      fi

      msg=$(mongo $DATABASE --host $HOST --port $PORT --username $USER_ADM --password $PASSWD_ADM --authenticationDatabase $DATABASE_AUTH --eval 'db.fsyncUnlock()')
      if [[ $msg == *"fsyncUnlock completed"* && $msg == *"NumberLong(0)"* && $msg == *": 1"* ]]; then
        log "Database successful unlock"
      else # Problems into database's unlocking
        log "The database couldn't be unlocked. Confirm you have server's network access or there's not more than one lock"
      fi

    else # Problems in database's locking
      log "The database couldn't be locked"
    fi

  else # Problems creating folder's backup
    log "Failed to create folder, make sure you have write permissions or the folder already exists"
  fi

  ##
  # Checksum
  # To verify, run the following command: sha256sum --check checksum
  ##
  if $isBckDone; then
    log "Generating checksum file"
    cd $PATH_BACKUP && ($(sha256sum $FILE_NAME >checksum)) && cd - >/dev/null 2>&1
  fi

  log "Exiting the script that performs the database backup"
  log "- - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
  #
}

bk_general "$@"
