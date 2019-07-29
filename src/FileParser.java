import java.io.*;

public abstract class FileParser extends Thread{
    File file;
    InputStream in;
    OutputStream out;

    FileParser(File file, OutputStream out) throws FileNotFoundException {
        this.file = file;
        this.in = new FileInputStream(file);
        this.out = out;
        start();
    }

    @Override
    public abstract void run();
}
