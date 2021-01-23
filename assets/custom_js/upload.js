// The following jquery script is taken from https://stackoverflow.com/questions/48613992/bootstrap-4-file-input-doesnt-show-the-file-name
$('#uploadFiles').on('change', function () {
    //get the file name
    var fileName = $(this).val();
    //replace the "Choose a file" label
    $(this).next('.custom-file-label').html(fileName);
})
