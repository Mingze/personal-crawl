function export_txt (name, data){
    fs.writeFile(__dirname+'/Export'+name+'.txt', data, (err) => {
      if (err) throw err;
      console.log('File '+name +' exported!');
    });    
}

module.exports.export_txt = export_txt;